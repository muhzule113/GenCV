-- Fix add_tokens to use UPSERT instead of UPDATE-only
-- so existing users who don't have a row yet can still receive tokens
CREATE OR REPLACE FUNCTION add_tokens(p_user_id UUID, p_tokens INT)
RETURNS TABLE(balance INT)
LANGUAGE SQL
AS $$
  INSERT INTO user_tokens (user_id, balance)
  VALUES (p_user_id, p_tokens)
  ON CONFLICT (user_id)
  DO UPDATE SET balance = user_tokens.balance + p_tokens, updated_at = NOW()
  RETURNING balance;
$$;
-- Grant initial 5 tokens via Better Auth trigger (trg_grant_signup_tokens on public.user)

-- Grant initial 5 tokens to existing users who registered before the trigger existed
