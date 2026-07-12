-- Disable auto-grant trigger on user creation (abuse vector)
-- Note: original trigger was ON auth.users (InsForge). Now ON public.user (Better Auth).
DROP TRIGGER IF EXISTS trg_grant_signup_tokens ON public.user;

-- Add signup_bonus tracking column to user_tokens
ALTER TABLE user_tokens ADD COLUMN IF NOT EXISTS signup_bonus_claimed_at TIMESTAMPTZ;

-- Mark all existing users as already claimed (they already got bonus from the trigger)
UPDATE user_tokens SET signup_bonus_claimed_at = created_at WHERE signup_bonus_claimed_at IS NULL;
