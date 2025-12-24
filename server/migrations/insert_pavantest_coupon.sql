-- Migration: Create Coupons Table and Insert PAVANTEST Coupon
-- Description: Set up discount coupons system with default test coupon
-- Run this in Supabase SQL Editor

-- ============================================
-- Table: coupons
-- Purpose: Store discount coupons
-- ============================================
CREATE TABLE IF NOT EXISTS coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL, -- 'percentage' or 'fixed'
  discount_value DECIMAL(10, 2) NOT NULL,
  max_uses INTEGER,
  used_count INTEGER DEFAULT 0,
  valid_from TIMESTAMP WITH TIME ZONE,
  valid_until TIMESTAMP WITH TIME ZONE,
  applicable_plans TEXT[], -- Array of plan IDs
  is_active BOOLEAN DEFAULT true,
  single_use BOOLEAN DEFAULT false,
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if table already exists (idempotent)
DO $$
BEGIN
  -- Add discount_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'discount_type'
  ) THEN
    ALTER TABLE coupons ADD COLUMN discount_type TEXT NOT NULL DEFAULT 'percentage';
  END IF;

  -- Add discount_value column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'discount_value'
  ) THEN
    ALTER TABLE coupons ADD COLUMN discount_value DECIMAL(10, 2) NOT NULL DEFAULT 0;
  END IF;

  -- Add max_uses column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'max_uses'
  ) THEN
    ALTER TABLE coupons ADD COLUMN max_uses INTEGER;
  END IF;

  -- Add used_count column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'used_count'
  ) THEN
    ALTER TABLE coupons ADD COLUMN used_count INTEGER DEFAULT 0;
  END IF;

  -- Add valid_from column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'valid_from'
  ) THEN
    ALTER TABLE coupons ADD COLUMN valid_from TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add valid_until column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'valid_until'
  ) THEN
    ALTER TABLE coupons ADD COLUMN valid_until TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Add applicable_plans column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'applicable_plans'
  ) THEN
    ALTER TABLE coupons ADD COLUMN applicable_plans TEXT[];
  END IF;

  -- Add is_active column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE coupons ADD COLUMN is_active BOOLEAN DEFAULT true;
  END IF;

  -- Add single_use column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'single_use'
  ) THEN
    ALTER TABLE coupons ADD COLUMN single_use BOOLEAN DEFAULT false;
  END IF;

  -- Add created_by column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'created_by'
  ) THEN
    ALTER TABLE coupons ADD COLUMN created_by TEXT;
  END IF;

  -- Add created_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'created_at'
  ) THEN
    ALTER TABLE coupons ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'coupons' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE coupons ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
  END IF;
END $$;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_is_active ON coupons(is_active);

-- ============================================
-- Table: coupon_usage
-- Purpose: Track coupon usage by users
-- ============================================
CREATE TABLE IF NOT EXISTS coupon_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code TEXT NOT NULL,
  user_id TEXT NOT NULL,
  subscription_id TEXT,
  used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(coupon_code, user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupon_usage_coupon_code ON coupon_usage(coupon_code);
CREATE INDEX IF NOT EXISTS idx_coupon_usage_user_id ON coupon_usage(user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_usage ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Anyone can view active coupons" ON coupons;
DROP POLICY IF EXISTS "Service role can manage coupons" ON coupons;
DROP POLICY IF EXISTS "Users can view own coupon usage" ON coupon_usage;
DROP POLICY IF EXISTS "Service role can insert coupon usage" ON coupon_usage;

-- Policy: Service role can manage coupons (must come first - broadest access)
CREATE POLICY "Service role can manage coupons"
  ON coupons
  FOR ALL
  USING (true);

-- Policy: Anyone can view active coupons (for validation)
CREATE POLICY "Anyone can view active coupons"
  ON coupons
  FOR SELECT
  USING (is_active = true);

-- Policy: Users can view their own coupon usage
CREATE POLICY "Users can view own coupon usage"
  ON coupon_usage
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role can insert coupon usage
CREATE POLICY "Service role can insert coupon usage"
  ON coupon_usage
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Grant permissions
-- ============================================
GRANT ALL ON coupons TO service_role;
GRANT ALL ON coupon_usage TO service_role;

-- ============================================
-- Insert Default PAVANTEST Coupon
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
  100,
  10000,
  0,
  '2030-12-31 23:59:59+00',
  true,
  false,
  'system'
)
ON CONFLICT (code) DO UPDATE SET
  discount_type = EXCLUDED.discount_type,
  discount_value = EXCLUDED.discount_value,
  max_uses = EXCLUDED.max_uses,
  valid_until = EXCLUDED.valid_until,
  is_active = true,
  single_use = false,
  used_count = 0;

-- ============================================
-- Verification
-- ============================================
-- Check that tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' AND table_name IN ('coupons', 'coupon_usage');

-- Verify the PAVANTEST coupon was created
SELECT * FROM coupons WHERE code = 'PAVANTEST';
