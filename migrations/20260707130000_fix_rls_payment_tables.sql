-- Lock down RLS: revoke anon access, only service-role via Express backend
-- DROP existing wide-open policies
DROP POLICY IF EXISTS "admin_manage_payments" ON payment_transactions;
DROP POLICY IF EXISTS "admin_manage_ledger" ON token_ledger;

-- payment_transactions: service role only (all writes via Express with service key)
-- No anon access at all — not even read
CREATE POLICY "service_role_only_payments" ON payment_transactions
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

ALTER TABLE payment_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- token_ledger: service role only (append-only audit trail via Express)
CREATE POLICY "service_role_only_ledger" ON token_ledger
  FOR ALL
  USING (current_setting('role', true) = 'service_role')
  WITH CHECK (current_setting('role', true) = 'service_role');

ALTER TABLE token_ledger FORCE ROW LEVEL SECURITY;
ALTER TABLE token_ledger ENABLE ROW LEVEL SECURITY;
