-- Align Better Auth tables with required schema (session.token, account OAuth fields, etc.)

CREATE TABLE IF NOT EXISTS "user" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "session" (
  id TEXT PRIMARY KEY,
  expires_at TIMESTAMPTZ NOT NULL,
  token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "account" (
  id TEXT PRIMARY KEY,
  account_id TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  access_token TEXT,
  refresh_token TEXT,
  id_token TEXT,
  access_token_expires_at TIMESTAMPTZ,
  refresh_token_expires_at TIMESTAMPTZ,
  scope TEXT,
  password TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "verification" (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

-- Add missing columns on existing tables
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS token TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE "session" ADD COLUMN IF NOT EXISTS user_agent TEXT;

ALTER TABLE "account" ADD COLUMN IF NOT EXISTS id_token TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS access_token_expires_at TIMESTAMPTZ;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS refresh_token_expires_at TIMESTAMPTZ;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS scope TEXT;
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS password TEXT;

-- Backfill token for any existing sessions, then enforce NOT NULL + UNIQUE
UPDATE "session"
SET token = id
WHERE token IS NULL;

DO $$
BEGIN
  ALTER TABLE "session" ALTER COLUMN token SET NOT NULL;
EXCEPTION WHEN others THEN
  NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS session_token_uidx ON "session"(token);
