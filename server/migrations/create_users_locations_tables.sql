-- =====================================================
-- Fresh Database Schema - 3 Tables Only
-- gmail_id is the PRIMARY identifier
-- Run this AFTER DELETE_ALL_TABLES.sql
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLE 1: USERS
-- User Info + Subscription + Tokens
-- =====================================================
CREATE TABLE users (
  gmail_id TEXT PRIMARY KEY,                    -- User's Gmail (e.g., "user@gmail.com")
  firebase_uid TEXT,                            -- Firebase Auth UID
  display_name TEXT,                            -- User's display name
  subscription_status TEXT DEFAULT 'trial',     -- 'trial', 'active', 'expired', 'admin'
  trial_start_date TIMESTAMPTZ,                 -- When trial started
  trial_end_date TIMESTAMPTZ,                   -- 15 days from trial start
  subscription_start_date TIMESTAMPTZ,          -- When user paid
  subscription_end_date TIMESTAMPTZ,            -- When subscription expires
  profile_count INTEGER DEFAULT 0,              -- Number of profiles user paid for
  is_admin BOOLEAN DEFAULT false,               -- TRUE for admin users (unlimited access)
  google_access_token TEXT,                     -- OAuth access token
  google_refresh_token TEXT,                    -- OAuth refresh token
  google_token_expiry BIGINT,                   -- Token expiry (Unix timestamp)
  google_account_id TEXT,                       -- GBP Account ID (CRITICAL for API calls)
  has_valid_token BOOLEAN DEFAULT false,        -- TRUE if tokens are working
  token_last_refreshed TIMESTAMPTZ,             -- Last token refresh time
  token_error TEXT,                             -- Last token error message
  razorpay_order_id TEXT,                       -- Payment order ID
  razorpay_payment_id TEXT,                     -- Payment ID
  razorpay_subscription_id TEXT,                -- Subscription ID
  amount_paid INTEGER DEFAULT 0,                -- Amount in paise
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for users
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_users_google_account_id ON users(google_account_id);
CREATE INDEX idx_users_has_valid_token ON users(has_valid_token) WHERE has_valid_token = true;

-- =====================================================
-- TABLE 2: USER_LOCATIONS
-- User's Business Locations + Automation Settings
-- =====================================================
CREATE TABLE user_locations (
  id SERIAL PRIMARY KEY,                        -- Auto-increment ID
  gmail_id TEXT NOT NULL REFERENCES users(gmail_id) ON DELETE CASCADE,  -- Links to user
  location_id TEXT NOT NULL,                    -- GBP Location ID (just the number)
  business_name TEXT,                           -- Actual business name (NOT the path!)
  address TEXT,                                 -- Full business address
  category TEXT,                                -- Business category
  keywords TEXT,                                -- SEO keywords for AI posts
  autoposting_enabled BOOLEAN DEFAULT false,    -- Is auto-posting turned ON?
  autoposting_schedule TEXT DEFAULT '10:00',    -- Post time in HH:MM (24hr)
  autoposting_frequency TEXT DEFAULT 'daily',   -- 'daily', 'alternative', 'weekly'
  autoposting_timezone TEXT DEFAULT 'Asia/Kolkata',
  autoposting_status TEXT DEFAULT 'disabled',   -- 'active', 'disabled', 'blocked_no_subscription', etc.
  autoposting_status_reason TEXT,               -- Human-readable reason
  last_post_date TIMESTAMPTZ,                   -- When last post was created
  last_post_success BOOLEAN,                    -- Did last post succeed?
  last_post_error TEXT,                         -- Last post error message
  next_post_date TIMESTAMPTZ,                   -- Next scheduled post time
  total_posts_created INTEGER DEFAULT 0,        -- Total posts for this location
  autoreply_enabled BOOLEAN DEFAULT false,      -- Auto-reply to reviews enabled?
  autoreply_status TEXT DEFAULT 'disabled',     -- 'active', 'disabled', 'blocked'
  autoreply_status_reason TEXT,                 -- Reason for status
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(gmail_id, location_id)                 -- One location per user
);

-- Indexes for user_locations
CREATE INDEX idx_user_locations_gmail_id ON user_locations(gmail_id);
CREATE INDEX idx_user_locations_location_id ON user_locations(location_id);
CREATE INDEX idx_user_locations_autoposting ON user_locations(autoposting_enabled) WHERE autoposting_enabled = true;
CREATE INDEX idx_user_locations_autoreply ON user_locations(autoreply_enabled) WHERE autoreply_enabled = true;

-- =====================================================
-- TABLE 3: QR_CODES
-- QR Codes for Review Requests
-- =====================================================
CREATE TABLE qr_codes (
  code TEXT PRIMARY KEY,                        -- Same as location_id
  gmail_id TEXT NOT NULL REFERENCES users(gmail_id) ON DELETE CASCADE,  -- Links to user
  user_id TEXT,                                 -- Firebase UID (backward compatibility)
  location_id TEXT NOT NULL,                    -- GBP Location ID
  location_name TEXT,                           -- Business name
  address TEXT,                                 -- Business address
  place_id TEXT,                                -- Google Place ID
  qr_data_url TEXT,                             -- Base64 QR code image
  review_link TEXT,                             -- Google review link
  public_review_url TEXT,                       -- Public review page URL
  keywords TEXT,                                -- Keywords for AI review suggestions
  business_category TEXT,                       -- Business category
  scans INTEGER DEFAULT 0,                      -- QR scan count
  last_scanned_at TIMESTAMPTZ,                  -- Last scan time
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for qr_codes
CREATE INDEX idx_qr_codes_gmail_id ON qr_codes(gmail_id);
CREATE INDEX idx_qr_codes_location_id ON qr_codes(location_id);

-- =====================================================
-- TABLE 4: COUPONS
-- Discount Coupons
-- =====================================================
CREATE TABLE coupons (
  code TEXT PRIMARY KEY,                        -- Coupon code (e.g., "SAVE20")
  gmail_id TEXT REFERENCES users(gmail_id) ON DELETE SET NULL,  -- Creator (admin)
  discount_type TEXT NOT NULL,                  -- 'percentage' or 'fixed'
  discount_value INTEGER NOT NULL,              -- Amount (percentage or paise)
  max_uses INTEGER,                             -- Max total uses (NULL = unlimited)
  used_count INTEGER DEFAULT 0,                 -- Times used
  valid_from TIMESTAMPTZ,                       -- Start date
  valid_until TIMESTAMPTZ,                      -- Expiry date
  is_active BOOLEAN DEFAULT true,               -- Is coupon active?
  single_use BOOLEAN DEFAULT false,             -- One use per user?
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_coupons_is_active ON coupons(is_active) WHERE is_active = true;

-- =====================================================
-- TABLE 5: COUPON_USAGE
-- Track which users used which coupons
-- =====================================================
CREATE TABLE coupon_usage (
  gmail_id TEXT NOT NULL REFERENCES users(gmail_id) ON DELETE CASCADE,  -- User who used
  coupon_code TEXT NOT NULL REFERENCES coupons(code) ON DELETE CASCADE, -- Coupon used
  used_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (gmail_id, coupon_code)           -- One use per user per coupon
);

-- =====================================================
-- TRIGGER: Auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_locations_updated_at
  BEFORE UPDATE ON user_locations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qr_codes_updated_at
  BEFORE UPDATE ON qr_codes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at
  BEFORE UPDATE ON coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SET ADMIN USER
-- =====================================================
INSERT INTO users (gmail_id, subscription_status, is_admin, created_at)
VALUES ('digibusy01shakti@gmail.com', 'admin', true, NOW());

-- =====================================================
-- GRANTS
-- =====================================================
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'users' as table_name, COUNT(*) as records FROM users
UNION ALL
SELECT 'user_locations', COUNT(*) FROM user_locations
UNION ALL
SELECT 'qr_codes', COUNT(*) FROM qr_codes
UNION ALL
SELECT 'coupons', COUNT(*) FROM coupons
UNION ALL
SELECT 'coupon_usage', COUNT(*) FROM coupon_usage;

-- =====================================================
-- DONE! 5 Tables Created:
-- 1. users (gmail_id is PRIMARY KEY)
-- 2. user_locations (gmail_id + location_id is UNIQUE)
-- 3. qr_codes (code is PRIMARY KEY, linked to gmail_id)
-- 4. coupons (code is PRIMARY KEY)
-- 5. coupon_usage (gmail_id + coupon_code is PRIMARY KEY)
-- =====================================================
