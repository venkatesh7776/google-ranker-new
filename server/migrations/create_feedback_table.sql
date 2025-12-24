-- Migration: Create Feedback Table
-- Description: Store customer feedback for ratings 1-3 stars
-- Run this in Supabase SQL Editor

-- ============================================
-- Table: customer_feedback
-- Purpose: Store feedback from customers who gave low ratings
-- ============================================
CREATE TABLE IF NOT EXISTS customer_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT NOT NULL,
  feedback_category TEXT, -- e.g., 'service', 'quality', 'cleanliness', 'other'
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by TEXT,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_feedback_location
  ON customer_feedback(location_id);

CREATE INDEX IF NOT EXISTS idx_feedback_user
  ON customer_feedback(user_id);

CREATE INDEX IF NOT EXISTS idx_feedback_rating
  ON customer_feedback(rating);

CREATE INDEX IF NOT EXISTS idx_feedback_created
  ON customer_feedback(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_feedback_resolved
  ON customer_feedback(is_resolved);

CREATE INDEX IF NOT EXISTS idx_feedback_location_user
  ON customer_feedback(location_id, user_id);

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE customer_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own feedback" ON customer_feedback;
DROP POLICY IF EXISTS "Service role can insert feedback" ON customer_feedback;
DROP POLICY IF EXISTS "Users can update own feedback" ON customer_feedback;

-- Policy: Users can view their own feedback
CREATE POLICY "Users can view own feedback"
  ON customer_feedback
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- Policy: Service role can insert feedback (for public form submissions)
CREATE POLICY "Service role can insert feedback"
  ON customer_feedback
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can update their own feedback (for resolving)
CREATE POLICY "Users can update own feedback"
  ON customer_feedback
  FOR UPDATE
  USING (auth.uid()::text = user_id);

-- ============================================
-- Grant permissions
-- ============================================
GRANT ALL ON customer_feedback TO service_role;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE customer_feedback IS 'Stores customer feedback for low ratings (1-3 stars) collected via QR codes';

COMMENT ON COLUMN customer_feedback.location_id IS 'Google Business Profile location ID';
COMMENT ON COLUMN customer_feedback.user_id IS 'Firebase user ID who owns this location';
COMMENT ON COLUMN customer_feedback.customer_name IS 'Name of customer who provided feedback';
COMMENT ON COLUMN customer_feedback.customer_email IS 'Email of customer (optional)';
COMMENT ON COLUMN customer_feedback.customer_phone IS 'Phone of customer (optional)';
COMMENT ON COLUMN customer_feedback.rating IS 'Star rating given (1-5, typically 1-3 for feedback form)';
COMMENT ON COLUMN customer_feedback.feedback_text IS 'Detailed feedback from customer';
COMMENT ON COLUMN customer_feedback.feedback_category IS 'Category of feedback (service, quality, etc.)';
COMMENT ON COLUMN customer_feedback.is_resolved IS 'Whether the feedback has been addressed';
COMMENT ON COLUMN customer_feedback.resolved_by IS 'User ID who marked as resolved';
COMMENT ON COLUMN customer_feedback.resolved_at IS 'Timestamp when marked as resolved';
COMMENT ON COLUMN customer_feedback.resolution_notes IS 'Notes about how feedback was resolved';

-- ============================================
-- Verification query
-- ============================================
-- Uncomment to verify table was created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'customer_feedback';
