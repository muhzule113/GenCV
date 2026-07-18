-- GenCV full Postgres bootstrap (self-hosted)
-- Better Auth user.id is TEXT — all user_id FKs use TEXT (not UUID).
-- Auth is enforced in Express; no PostgREST/InsForge RLS.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Better Auth
-- ============================================================
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
  token TEXT NOT NULL UNIQUE,
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

-- Upgrade incomplete Better Auth tables created by older schemas
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
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE "account" ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

UPDATE "session" SET token = id WHERE token IS NULL;
DO $$
BEGIN
  ALTER TABLE "session" ALTER COLUMN token SET NOT NULL;
EXCEPTION WHEN others THEN
  NULL;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS session_token_uidx ON "session"(token);

-- ============================================================
-- Templates + CVs + Cover letters
-- ============================================================
CREATE TABLE IF NOT EXISTS templates (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO templates (id, name, description, is_active, created_at) VALUES
  ('ats-clean-v1', 'ATS Clean', 'Satu kolom hitam-putih murni, 100% ATS-friendly.', true, NOW()),
  ('ats-modern-minimal-v1', 'ATS Modern Minimal', 'Aksen warna slate tipis pada garis nama, profesional dan bersih.', true, NOW()),
  ('executive-serif-v1', 'Executive Serif', 'Serif elegan untuk posisi senior / management.', true, NOW()),
  ('compact-onepage-v1', 'Compact One Page', 'Padat satu halaman untuk pengalaman singkat.', true, NOW()),
  ('sidebar-slim-v1', 'Sidebar Slim', 'Sidebar tipis untuk skill dan kontak.', true, NOW()),
  ('academic-minimal-v1', 'Academic Minimal', 'Fokus publikasi dan riset.', true, NOW()),
  ('technical-minimal-v1', 'Technical Minimal', 'Fokus stack dan project teknis.', true, NOW()),
  ('fresh-graduate-minimal-v1', 'Fresh Graduate Minimal', 'Highlight pendidikan dan organisasi.', true, NOW()),
  ('timeline-minimal-v1', 'Timeline Minimal', 'Pengalaman dalam gaya timeline.', true, NOW()),
  ('two-tone-minimal-v1', 'Two Tone Minimal', 'Dua tone warna, tetap ATS-safe.', true, NOW())
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS cvs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  template_id VARCHAR(50) NOT NULL DEFAULT 'ats-clean-v1' REFERENCES templates(id),
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  share_token TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS cvs_user_id_idx ON cvs(user_id);
CREATE INDEX IF NOT EXISTS cvs_user_created_idx ON cvs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cvs_share_token_idx ON cvs(share_token) WHERE share_token IS NOT NULL;

CREATE TABLE IF NOT EXISTS cover_letters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  cv_id UUID REFERENCES cvs(id) ON DELETE SET NULL,
  position VARCHAR(200) NOT NULL,
  company VARCHAR(200) NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT cover_letters_cv_user_unique UNIQUE (cv_id, user_id)
);

CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_cv_id_idx ON cover_letters(cv_id);

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT user_profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);

-- ============================================================
-- Tokens + payments
-- ============================================================
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id TEXT PRIMARY KEY REFERENCES "user"(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS token_packages (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tokens INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO token_packages (id, name, tokens, price) VALUES
  ('starter', 'Starter Pack', 10, 15000),
  ('popular', 'Popular Pack', 25, 30000),
  ('pro', 'Pro Pack', 60, 60000)
ON CONFLICT (id) DO NOTHING;

CREATE TABLE IF NOT EXISTS token_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  package_id VARCHAR(20) NOT NULL REFERENCES token_packages(id),
  tokens INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  order_id TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_purchases_user_idx ON token_purchases(user_id);
CREATE INDEX IF NOT EXISTS token_purchases_status_idx ON token_purchases(status);
CREATE INDEX IF NOT EXISTS token_purchases_order_idx ON token_purchases(order_id);

CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  package_id VARCHAR(20) REFERENCES token_packages(id),
  tokens INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  snap_token TEXT,
  midtrans_transaction_id TEXT,
  payment_method VARCHAR(50),
  raw_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  settled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS payment_transactions_user_idx ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS payment_transactions_order_idx ON payment_transactions(order_id);

CREATE TABLE IF NOT EXISTS token_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  tx_id UUID REFERENCES payment_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_ledger_user_idx ON token_ledger(user_id);
CREATE INDEX IF NOT EXISTS token_ledger_tx_idx ON token_ledger(tx_id);

-- ============================================================
-- RPCs
-- ============================================================
CREATE OR REPLACE FUNCTION deduct_token(p_user_id TEXT)
RETURNS TABLE(balance INT, total_used INT)
LANGUAGE SQL
AS $$
  UPDATE user_tokens
  SET balance = user_tokens.balance - 1,
      total_used = user_tokens.total_used + 1,
      updated_at = NOW()
  WHERE user_id = p_user_id AND user_tokens.balance >= 1
  RETURNING user_tokens.balance, user_tokens.total_used;
$$;

CREATE OR REPLACE FUNCTION refund_token(p_user_id TEXT)
RETURNS TABLE(balance INT, total_used INT)
LANGUAGE SQL
AS $$
  UPDATE user_tokens
  SET balance = user_tokens.balance + 1,
      total_used = GREATEST(user_tokens.total_used - 1, 0),
      updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING user_tokens.balance, user_tokens.total_used;
$$;

CREATE OR REPLACE FUNCTION add_tokens(p_user_id TEXT, p_tokens INT)
RETURNS TABLE(balance INT)
LANGUAGE SQL
AS $$
  INSERT INTO user_tokens (user_id, balance)
  VALUES (p_user_id, p_tokens)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_tokens.balance + EXCLUDED.balance,
    updated_at = NOW()
  RETURNING user_tokens.balance;
$$;

CREATE OR REPLACE FUNCTION credit_tokens(
  p_order_id TEXT,
  p_midtrans_tx_id TEXT,
  p_payment_method VARCHAR,
  p_raw JSONB
) RETURNS TABLE(balance INT)
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_user_id TEXT;
  v_status VARCHAR;
  v_tokens INT;
  v_tx_id UUID;
BEGIN
  SELECT pt.user_id, pt.status, pt.tokens, pt.id
    INTO v_user_id, v_status, v_tokens, v_tx_id
  FROM payment_transactions pt
  WHERE pt.order_id = p_order_id
  FOR UPDATE;

  IF v_status = 'settlement' THEN
    RETURN QUERY SELECT ut.balance FROM user_tokens ut WHERE ut.user_id = v_user_id;
    RETURN;
  END IF;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Transaction not found: %', p_order_id;
  END IF;

  UPDATE payment_transactions SET
    status = 'settlement',
    midtrans_transaction_id = p_midtrans_tx_id,
    payment_method = p_payment_method,
    raw_response = p_raw,
    settled_at = NOW()
  WHERE order_id = p_order_id;

  UPDATE token_purchases SET
    status = 'completed',
    order_id = p_order_id,
    payment_method = p_payment_method,
    paid_at = NOW()
  WHERE order_id = p_order_id
    AND status = 'pending';

  INSERT INTO token_ledger (user_id, delta, reason, tx_id)
  VALUES (v_user_id, v_tokens, 'topup:' || p_order_id, v_tx_id);

  RETURN QUERY
  INSERT INTO user_tokens (user_id, balance)
  VALUES (v_user_id, v_tokens)
  ON CONFLICT (user_id)
  DO UPDATE SET
    balance = user_tokens.balance + EXCLUDED.balance,
    updated_at = NOW()
  RETURNING user_tokens.balance;
END;
$$;
