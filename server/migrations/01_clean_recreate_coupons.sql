-- Migration: Clean Recreate Coupons Table
-- Description: Drop existing corrupted coupons table and create fresh
-- WARNING: This will delete all existing coupon data
-- Run this in Supabase SQL Editor

-- ============================================
-- STEP 1: Drop existing tables and policies
-- ============================================

-- Drop RLS policies first
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Service role can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Service role can insert coupon usage" ON coupon_usage;

-- Drop tables (CASCADE will drop dependent objects)
DROP TABLE IF EXISTS coupon_usage CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;

-- ============================================
-- STEP 2: Create coupons table with correct schema
-- ============================================
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL,
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_plans TEXT[],
  is_active BOOLEAN DEFAULT true,
  single_use BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_is_active ON coupons(is_active);

-- ============================================
-- STEP 3: Create coupon_usage table
-- ============================================
CREATE TABLE coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_code, user_id)
);

-- Create indexes
CREATE INDEX idx_coupon_usage_coupon_code ON coupon_usage(coupon_code);
CREATE INDEX idx_coupon_usage_user_id ON coupon_usage(user_id);

-- ============================================
-- STEP 4: Enable RLS and create policies
-- ============================================

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Coupons policies
CREATE POLICY "Service role can manage coupons"
  ON coupons FOR ALL
  USING (true);

CREATE POLICY "Anyone can view active coupons"
  ON coupons FOR SELECT
  USING (is_active = true);

-- Coupon usage policies
CREATE POLICY "Users can view own coupon usage"
  ON coupon_usage FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Service role can insert coupon usage"
  ON coupon_usage FOR INSERT
  WITH CHECK (true);

-- ============================================
-- STEP 5: Grant permissions
-- ============================================
GRANT ALL ON coupons TO service_role;
GRANT ALL ON coupon_usage TO service_role;

-- ============================================
-- STEP 6: Insert PAVANTEST coupon
-- ============================================
INSERT INTO coupons (
  code,
  discount_type,
  discount_value,
  max_uses,
  used_count,
  valid_until,
  is_active,
  single_use,
  created_by
) VALUES (
  'PAVANTEST',
  'percentage',
  100.00,
  10000,
  0,
  '2030-12-31 23:59:59+00',
  true,
  false,
  'system'
);

-- ============================================
-- STEP 7: Verification
-- ============================================

-- Show table structure
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'coupons'
ORDER BY ordinal_position;

-- Show the coupon
SELECT * FROM coupons WHERE code = 'PAVANTEST';

-- Success message
SELECT
  'SUCCESS: Coupons table recreated with PAVANTEST coupon' as message,
  COUNT(*) as total_coupons
FROM coupons;
