-- Token System Migration
-- Run via: insforge MCP run-raw-sql

-- User token balances
CREATE TABLE IF NOT EXISTS user_tokens (
  user_id UUID PRIMARY KEY,
  balance INTEGER NOT NULL DEFAULT 5,
  total_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_tokens" ON user_tokens;
CREATE POLICY "admin_manage_tokens" ON user_tokens FOR ALL USING (true) WITH CHECK (true);

-- Token packages for purchase
CREATE TABLE IF NOT EXISTS token_packages (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  tokens INTEGER NOT NULL,
  price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE token_packages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anyone_read_packages" ON token_packages;
CREATE POLICY "anyone_read_packages" ON token_packages FOR SELECT USING (true);

INSERT INTO token_packages (id, name, tokens, price) VALUES
  ('starter', 'Starter Pack', 10, 15000),
  ('popular', 'Popular Pack', 25, 30000),
  ('pro', 'Pro Pack', 60, 60000)
ON CONFLICT (id) DO NOTHING;

-- Purchase history
CREATE TABLE IF NOT EXISTS token_purchases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  package_id VARCHAR(20) NOT NULL REFERENCES token_packages(id),
  tokens INTEGER NOT NULL,
  amount INTEGER NOT NULL,
  payment_method VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS token_purchases_user_idx ON token_purchases(user_id);
ALTER TABLE token_purchases ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "admin_manage_purchases" ON token_purchases;
CREATE POLICY "admin_manage_purchases" ON token_purchases FOR ALL USING (true) WITH CHECK (true);

-- Atomic token deduction (returns false if insufficient)
CREATE OR REPLACE FUNCTION deduct_token(p_user_id UUID)
RETURNS TABLE(balance INT, total_used INT)
LANGUAGE SQL
AS $$
  UPDATE user_tokens
  SET balance = balance - 1, total_used = total_used + 1, updated_at = NOW()
  WHERE user_id = p_user_id AND balance >= 1
  RETURNING balance, total_used;
$$;

-- Grant initial tokens on user creation
CREATE OR REPLACE FUNCTION grant_signup_tokens()
RETURNS TRIGGER
LANGUAGE PLPGSQL
AS $$
BEGIN
  INSERT INTO user_tokens (user_id, balance) VALUES (NEW.id, 5)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Refund 1 token on AI failure
CREATE OR REPLACE FUNCTION refund_token(p_user_id UUID)
RETURNS TABLE(balance INT, total_used INT)
LANGUAGE SQL
AS $$
  UPDATE user_tokens
  SET balance = balance + 1, total_used = total_used - 1, updated_at = NOW()
  WHERE user_id = p_user_id AND total_used > 0
  RETURNING balance, total_used;
$$;

-- Add tokens (after purchase confirmed)
CREATE OR REPLACE FUNCTION add_tokens(p_user_id UUID, p_tokens INT)
RETURNS TABLE(balance INT)
LANGUAGE SQL
AS $$
  UPDATE user_tokens
  SET balance = balance + p_tokens, updated_at = NOW()
  WHERE user_id = p_user_id
  RETURNING balance;
$$;

-- Attach trigger to public.user (Better Auth)
DROP TRIGGER IF EXISTS trg_grant_signup_tokens ON public.user;
CREATE TRIGGER trg_grant_signup_tokens
  AFTER INSERT ON public.user
  FOR EACH ROW
  EXECUTE FUNCTION grant_signup_tokens();
