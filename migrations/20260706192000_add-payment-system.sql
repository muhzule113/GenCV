-- Midtrans Payment System Migration
-- payment_transactions: stores every Midtrans transaction
-- token_ledger: append-only audit trail for token movements
-- credit_tokens: idempotent RPC called by webhook

-- ============================================================
-- 1. Payment Transactions table
-- ============================================================
CREATE TABLE IF NOT EXISTS payment_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
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

ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_payments" ON payment_transactions;
CREATE POLICY "admin_manage_payments" ON payment_transactions
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 2. Token Ledger (append-only audit trail)
-- ============================================================
CREATE TABLE IF NOT EXISTS token_ledger (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  delta INTEGER NOT NULL,
  reason TEXT NOT NULL,
  tx_id UUID REFERENCES payment_transactions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS token_ledger_user_idx ON token_ledger(user_id);
CREATE INDEX IF NOT EXISTS token_ledger_tx_idx ON token_ledger(tx_id);

ALTER TABLE token_ledger ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admin_manage_ledger" ON token_ledger;
CREATE POLICY "admin_manage_ledger" ON token_ledger
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 3. Add order_id column to token_purchases for back-reference
-- ============================================================
ALTER TABLE token_purchases ADD COLUMN IF NOT EXISTS order_id TEXT;

-- ============================================================
-- 4. Idempotent credit_tokens RPC
--    Called by Midtrans webhook handler.
--    Uses SELECT FOR UPDATE to prevent double-credit.
--    Logs to token_ledger for audit trail.
-- ============================================================
CREATE OR REPLACE FUNCTION credit_tokens(
  p_order_id TEXT,
  p_midtrans_tx_id TEXT,
  p_payment_method VARCHAR,
  p_raw JSONB
) RETURNS TABLE(balance INT)
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_user_id UUID;
  v_status VARCHAR;
  v_tokens INT;
  v_tx_id UUID;
BEGIN
  -- Lock row and check existing settlement (idempotent)
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

  -- Update payment transaction
  UPDATE payment_transactions SET
    status = 'settlement',
    midtrans_transaction_id = p_midtrans_tx_id,
    payment_method = p_payment_method,
    raw_response = p_raw,
    settled_at = NOW()
  WHERE order_id = p_order_id;

  -- Update token_purchases linked to this transaction
  UPDATE token_purchases SET
    status = 'completed',
    order_id = p_order_id,
    payment_method = p_payment_method,
    paid_at = NOW()
  WHERE id = v_tx_id
    AND status = 'pending';

  -- Log to ledger
  INSERT INTO token_ledger (user_id, delta, reason, tx_id)
  VALUES (v_user_id, v_tokens, 'topup:' || p_order_id, v_tx_id);

  -- Add tokens to user balance (table-qualified to avoid ambiguity with RETURNS TABLE)
  RETURN QUERY
  UPDATE user_tokens
  SET balance = user_tokens.balance + v_tokens, updated_at = NOW()
  WHERE user_id = v_user_id
  RETURNING user_tokens.balance;
END;
$$;
