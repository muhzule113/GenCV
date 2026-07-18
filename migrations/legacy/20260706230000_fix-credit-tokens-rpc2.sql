-- Fix credit_tokens RPC v2: qualify balance in SET clause too
-- The RETURNS TABLE(balance INT) creates an output column that conflicts
-- with user_tokens.balance in UPDATE SET balance = balance + v_tokens

DROP FUNCTION IF EXISTS credit_tokens(TEXT, TEXT, VARCHAR, JSONB);

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
  WHERE id = v_tx_id
    AND status = 'pending';

  INSERT INTO token_ledger (user_id, delta, reason, tx_id)
  VALUES (v_user_id, v_tokens, 'topup:' || p_order_id, v_tx_id);

  -- Use table-qualified column to avoid ambiguity with RETURNS TABLE(balance)
  RETURN QUERY
  UPDATE user_tokens
  SET balance = user_tokens.balance + v_tokens, updated_at = NOW()
  WHERE user_id = v_user_id
  RETURNING user_tokens.balance;
END;
$$;
