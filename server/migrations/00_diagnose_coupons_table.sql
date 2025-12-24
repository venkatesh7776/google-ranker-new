-- Diagnostic Query: Check Coupons Table Schema
-- Run this FIRST in Supabase SQL Editor to see what exists

-- ============================================
-- 1. Check if coupons table exists
-- ============================================
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'coupons';

-- ============================================
-- 2. List ALL columns in coupons table
-- ============================================
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'coupons'
ORDER BY ordinal_position;

-- ============================================
-- 3. List ALL constraints on coupons table
-- ============================================
SELECT
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE n.nspname = 'public' AND cl.relname = 'coupons';

-- ============================================
-- 4. Show existing data in coupons table
-- ============================================
SELECT * FROM coupons;

-- ============================================
-- 5. List all indexes
-- ============================================
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'coupons' AND schemaname = 'public';
