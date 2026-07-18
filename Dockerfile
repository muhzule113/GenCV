# ---- Stage 1: Build frontend ----
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite embeds these at build time — pass via docker compose build.args / CI
ARG VITE_API_BASE_URL=https://gencv.muhzule.com
ARG VITE_APP_URL=https://gencv.muhzule.com
ARG VITE_MIDTRANS_CLIENT_KEY=
ARG VITE_SENTRY_DSN=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_APP_URL=$VITE_APP_URL \
    VITE_MIDTRANS_CLIENT_KEY=$VITE_MIDTRANS_CLIENT_KEY \
    VITE_SENTRY_DSN=$VITE_SENTRY_DSN

RUN npm run build

# ---- Stage 2: Runtime ----
FROM node:22-alpine
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV RUN_MIGRATIONS=true

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/server ./src/server
COPY --from=builder /app/migrations ./migrations
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/ecosystem.config.cjs ./
RUN chmod +x /app/scripts/docker-entrypoint.sh

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/healthz || exit 1

CMD ["/app/scripts/docker-entrypoint.sh"]
