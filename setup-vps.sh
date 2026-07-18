#!/usr/bin/env bash
set -euo pipefail

# ============================================================
# GenCV VPS Auto-Setup
# Tencent Cloud · 2GB RAM · 40GB SSD · Ubuntu 22.04
# Installs: Docker + 9Router + GenCV (Docker)
# ============================================================

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; CYAN='\033[0;36m'; NC='\033[0m'
info()  { echo -e "${CYAN}[INFO]${NC} $1"; }
ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
err()   { echo -e "${RED}[ERR]${NC} $1"; exit 1; }

# ── Config ──────────────────────────────────────────────
REPO_URL="${1:-}"
DOMAIN="${2:-}"
VERSION="1.0.0"

if [ -z "$REPO_URL" ]; then
  echo ""
  echo "  GenCV VPS Setup v${VERSION}"
  echo "  =========================="
  echo ""
  echo "  Usage: bash setup-vps.sh <git-repo-url> [domain]"
  echo ""
  echo "  Contoh:"
  echo "    bash setup-vps.sh https://github.com/user/GenCV.git"
  echo "    bash setup-vps.sh https://github.com/user/GenCV.git gencv.my.id"
  echo ""
  exit 0
fi

# ── 1. System update ──────────────────────────────────
info "Updating system packages..."
apt update && apt upgrade -y
ok "System updated"

# ── 2. Install Docker ─────────────────────────────────
if ! command -v docker &>/dev/null; then
  info "Installing Docker..."
  curl -fsSL https://get.docker.com | sh
  systemctl enable --now docker
  ok "Docker installed"
else
  ok "Docker already installed"
fi

# ── 3. Install Node.js (for 9Router) ──────────────────
if ! command -v node &>/dev/null; then
  info "Installing Node.js 22..."
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
  apt install nodejs -y
  ok "Node.js $(node --version) installed"
else
  ok "Node.js $(node --version) already installed"
fi

# ── 4. Install 9Router ────────────────────────────────
if ! command -v 9router &>/dev/null; then
  info "Installing 9Router..."
  npm install -g 9router
  ok "9Router installed"
else
  ok "9Router already installed"
fi

# ── 5. Create 9Router systemd service ─────────────────
info "Creating 9Router systemd service..."
cat > /etc/systemd/system/9router.service <<'SERVICE'
[Unit]
Description=9Router — AI Router
After=network.target

[Service]
Type=simple
User=root
ExecStart=$(which node) $(which 9router)
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
SERVICE

# Fix path in service file
NODE_PATH=$(which node)
ROUTER_PATH=$(which 9router)
sed -i "s|\$(which node)|$NODE_PATH|g" /etc/systemd/system/9router.service
sed -i "s|\$(which 9router)|$ROUTER_PATH|g" /etc/systemd/system/9router.service

systemctl daemon-reload
systemctl enable --now 9router
ok "9Router service started (port 20128)"

# ── 6. Clone / setup GenCV ────────────────────────────
INSTALL_DIR="/opt/gencv"
if [ -d "$INSTALL_DIR" ]; then
  info "GenCV directory exists — pulling latest..."
  cd "$INSTALL_DIR"
  git pull
else
  info "Cloning GenCV from $REPO_URL ..."
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi
ok "GenCV code ready at $INSTALL_DIR"
# ── 7. Setup .env ────────────────────────────────────
if [ ! -f "$INSTALL_DIR/.env" ]; then
  info "Creating .env from .env.production..."
  cp "$INSTALL_DIR/.env.production" "$INSTALL_DIR/.env"

  # Set domain in .env
  if [ -n "$DOMAIN" ]; then
    CLIENT_URL="https://$DOMAIN"
    API_URL="https://$DOMAIN"
  else
    CLIENT_URL="http://localhost:5000"
    API_URL="http://localhost:5000"
  fi
  sed -i "s|CLIENT_URL=.*|CLIENT_URL=${CLIENT_URL}|" "$INSTALL_DIR/.env"
  sed -i "s|VITE_API_BASE_URL=.*|VITE_API_BASE_URL=${API_URL}|" "$INSTALL_DIR/.env"

  echo ""
  warn "EDIT .env DULU sebelum lanjut:"
  echo "   nano ${INSTALL_DIR}/.env"
  echo "   Isi: DATABASE_URL / DB_PASSWORD, BETTER_AUTH_SECRET, GOOGLE_CLIENT_ID/SECRET, DEEPSEEK_API_KEY, MIDTRANS_SERVER_KEY"
  echo ""
  read -p "   Udah diedit? (y/n): " -n 1 -r REPLY
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    err "Edit dulu: nano $INSTALL_DIR/.env, lalu jalankan script lagi"
  fi
  ok ".env siap"
else
  ok ".env already exists — skipping"
fi

# ── 8. Build & run GenCV ──────────────────────────────
info "Building and starting GenCV..."
cd "$INSTALL_DIR"

# Pull latest images
docker compose pull 2>/dev/null || true

# Build & start
docker compose up -d --build
ok "GenCV running on port 5000"

# ── 9. Optional: Nginx + SSL ──────────────────────────
if [ -n "$DOMAIN" ]; then
  info "Setting up Nginx + SSL for $DOMAIN ..."

  if ! command -v nginx &>/dev/null; then
    apt install nginx -y
  fi

  # Create Nginx config
  cat > /etc/nginx/sites-available/gencv <<NGINX
server {
    listen 80;
    server_name ${DOMAIN} www.${DOMAIN};

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_read_timeout 30s;
    }
}
NGINX

  ln -sf /etc/nginx/sites-available/gencv /etc/nginx/sites-enabled/
  rm -f /etc/nginx/sites-enabled/default
  nginx -t && systemctl reload nginx
  ok "Nginx running on port 80 → proxy ke GenCV:5000"

  # SSL via Certbot
  info "Requesting SSL certificate from Let's Encrypt..."
  apt install certbot python3-certbot-nginx -y
  certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos --email "admin@${DOMAIN}" || true
  ok "SSL setup done — https://${DOMAIN}"
fi

# ── 10. Cleanup ───────────────────────────────────────
docker system prune -af --volumes 2>/dev/null || true

# ── Done ──────────────────────────────────────────────
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  GenCV VPS Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  9Router: http://$(curl -s ifconfig.me):20128"
echo "  GenCV:   http://$(curl -s ifconfig.me):5000"
if [ -n "$DOMAIN" ]; then
  echo "  Domain:  https://${DOMAIN}"
fi
echo ""
echo "  Manage GenCV: cd /opt/gencv && docker compose logs -f"
echo "  Manage 9Router: systemctl status 9router"
echo ""
