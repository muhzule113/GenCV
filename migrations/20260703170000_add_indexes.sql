-- ⚠️ ALREADY EXECUTED manually via InsForge SQL editor on 2026-07-03
-- Re-run safe (IF NOT EXISTS = idempotent)
-- 
-- Performance & Query Optimization Migration
-- Run via: insforge MCP run-raw-sql
-- Adds missing indexes based on query pattern analysis

-- cvs table: most queries filter by user_id or id
CREATE INDEX IF NOT EXISTS cvs_user_id_idx ON cvs(user_id);
CREATE INDEX IF NOT EXISTS cvs_user_created_idx ON cvs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS cvs_share_token_idx ON cvs(share_token) WHERE share_token IS NOT NULL;

-- cover_letters table: queries filter by user_id, cv_id (upsert conflict), and id
CREATE INDEX IF NOT EXISTS cover_letters_user_id_idx ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS cover_letters_cv_id_idx ON cover_letters(cv_id);
CREATE UNIQUE INDEX IF NOT EXISTS cover_letters_user_cv_idx ON cover_letters(user_id, cv_id);

-- token_purchases: already has token_purchases_user_idx
-- Verify it exists (idempotent)
CREATE INDEX IF NOT EXISTS token_purchases_status_idx ON token_purchases(status);

-- templates: rarely accessed, small table - no additional indexes needed
