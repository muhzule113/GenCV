# GenCV — agent notes

## Stack

- **Frontend:** React + Vite + Tailwind 3.4
- **Backend:** Express (`src/server`)
- **Auth:** Better Auth (email/password + Google OAuth)
- **DB:** Self-hosted PostgreSQL (`DATABASE_URL`), accessed via `postgres` + Drizzle adapter for Better Auth

## Database

- Bootstrap schema: `migrations/0001_init.sql`
- Apply: `npm run db:migrate`
- Docker Postgres: `docker compose up -d postgres` (needs `DB_PASSWORD` in `.env`)

Do **not** use InsForge. There is no `@insforge/sdk` in this project.

## Auth patterns

- Client: `src/lib/authClient.js` (`better-auth/client`)
- Server: `src/server/config/auth.js`
- Session cookies require CORS `credentials: true` and client `credentials: 'include'`
- Google redirect URI: `{API_ORIGIN}/api/auth/callback/google`

## Env

See `.env.example` for the full list. Required for local run:

`DATABASE_URL`, `BETTER_AUTH_SECRET`, `CLIENT_URL`, `VITE_API_BASE_URL`, `VITE_APP_URL`
