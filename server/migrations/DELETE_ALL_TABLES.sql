-- =====================================================
-- DELETE ALL TABLES
-- Run this FIRST in Supabase SQL Editor
-- =====================================================

DROP TABLE IF EXISTS automation_logs CASCADE;
DROP TABLE IF EXISTS automation_settings CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS audit_results CASCADE;
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS feedback CASCADE;
DROP TABLE IF EXISTS payment_history CASCADE;
DROP TABLE IF EXISTS qr_codes CASCADE;
DROP TABLE IF EXISTS user_locations CASCADE;
DROP TABLE IF EXISTS users CASCADE;

DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Verify all deleted
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
