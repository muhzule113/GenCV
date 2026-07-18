-- Rate limit for verification OTP resends (per email, per Jakarta calendar day)
CREATE TABLE IF NOT EXISTS otp_send_limits (
  email TEXT PRIMARY KEY,
  day_key TEXT NOT NULL,
  send_count INTEGER NOT NULL DEFAULT 0,
  last_sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS otp_send_limits_day_idx ON otp_send_limits(day_key);
