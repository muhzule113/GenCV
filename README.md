# GenCV

ATS-friendly **CV** and **cover letter** generator. Fill structured forms, get AI help where it matters, preview and export PDFs, and manage everything from a dashboard.

> *Help anyone look professional on paper in under 5 minutes.*

## Features

- **CV builder** — multi-step form, live preview, ATS-oriented templates, PDF export, autosave
- **Cover letter** — AI-generated drafts from your CV + job details, editable, PDF export
- **AI assists** — professional summary, skill/highlight suggestions, job-match analysis
- **OCR import** — pull text from an existing CV into the form (Tesseract.js)
- **Auth** — email/password with OTP verification, Google OAuth (Better Auth)
- **Token credits** — AI actions consume tokens; optional Midtrans top-up
- **Share** — public CV links (`/cv/s/:token`)
- **Dashboard** — list, edit, and manage CVs & letters

## Stack

| Layer | Tech |
|--------|------|
| Frontend | React 19, Vite 8, Tailwind CSS 3.4, React Router, Zustand, TanStack Query |
| Backend | Node.js, Express |
| Database | PostgreSQL (Docker or self-hosted) |
| Auth | Better Auth (sessions + Google OAuth) |
| AI | DeepSeek API |
| PDF | `@react-pdf/renderer` |
| Email | Nodemailer (SMTP / OTP) |

## Prerequisites

- Node.js 20+
- Docker (for local Postgres), or any PostgreSQL 17+ instance
- DeepSeek API key (for AI features)
- Google OAuth client (for “Sign in with Google”)
- SMTP credentials (for email verification OTP)

## Quick start

```bash
# 1. Install
npm install

# 2. Configure env
cp .env.example .env
# Fill BETTER_AUTH_SECRET, GOOGLE_*, DEEPSEEK_API_KEY, SMTP_*, etc.

# 3. Start Postgres
npm run db:up

# 4. Run migrations (if DB was not initialized by the compose volume)
npm run db:migrate

# 5. API + frontend (two terminals)
npm run server:dev   # http://localhost:5000
npm run dev          # http://localhost:5173
```

Generate an auth secret if needed:

```bash
openssl rand -base64 32
```

### Google OAuth (local)

Authorized redirect URI:

```
http://localhost:5000/api/auth/callback/google
```

Set the OAuth consent screen **App name** to GenCV (Client ID name in Console is internal only).

## Environment

See [`.env.example`](.env.example) for the full list. Important variables:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `DB_PASSWORD` | Password for Docker Compose Postgres |
| `BETTER_AUTH_SECRET` | Session/auth signing secret |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google login |
| `DEEPSEEK_API_KEY` | AI features |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS |
| `VITE_API_BASE_URL` / `VITE_APP_URL` | Frontend API & app URLs |
| `SMTP_*` / `SMTP_FROM` | Email OTP (use a real allowed From address) |
| `MIDTRANS_*` | Optional token top-up |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Vite frontend |
| `npm run server:dev` | Express API with watch |
| `npm run server` | Express API (no watch) |
| `npm run db:up` | Start Postgres via Docker Compose |
| `npm run db:migrate` | Apply SQL migrations |
| `npm run build` | Production frontend build |
| `npm run preview` | Preview production build |
| `npm test` | Vitest |
| `npm run lint` | ESLint |

## Project structure

```
src/
  pages/          # Routes (auth, dashboard, CV builder, letter builder, …)
  components/     # UI, CV templates, letter editor
  hooks/          # Data & form hooks
  store/          # Zustand stores
  services/       # API clients
  server/         # Express app, routes, controllers, auth, AI
migrations/       # SQL schema & migrations
scripts/          # DB migrate helper
public/           # Static assets
```

## Token system

AI actions (generate letter, recommend highlights/skills, summary, etc.) deduct **1 token** per call. New users receive a starter balance. Saving drafts and editing forms do not use tokens.

## Production notes

- Prefer `.env.production` (or your host’s secret store) over committing secrets.
- Point Google OAuth redirect URI at your production API callback.
- `docker compose` can run both `postgres` and `app` — see `docker-compose.yml` and `Dockerfile`.
- Token credits are applied only via Midtrans webhook / status poll (`credit_tokens`). There is no client “confirm purchase” endpoint.
- App container runs `scripts/db-migrate.js` on start (`RUN_MIGRATIONS=true`) so `0002_*` and later SQL apply after `0001` bootstrap.

### GitHub Deploy (`.github/workflows/deploy.yml`)

Set repository **variable** `ENABLE_DEPLOY=true` when the VPS is ready. Required **secrets**: `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`. Optional: `VITE_MIDTRANS_CLIENT_KEY`, `VITE_SENTRY_DSN`. Optional **variables**: `VITE_API_BASE_URL`, `VITE_APP_URL`, `DEPLOY_PATH` (default `/opt/gencv`), `DEPLOY_PORT` (default `22`).

On the VPS, keep a filled `.env.production` (including `VITE_*` — used as Docker build args) and a git checkout at `DEPLOY_PATH`.

## License

Private project (`package.json` → `"private": true`).
