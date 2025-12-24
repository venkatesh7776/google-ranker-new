-- Migration: Create Automation Activity History Tables
-- Description: Tables to track auto-posting and auto-reply activity for transparency and analytics
-- Run this in Supabase SQL Editor

-- ============================================
-- Table: automation_post_history
-- Purpose: Track all auto-posting activity
-- ============================================
CREATE TABLE IF NOT EXISTS automation_post_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  post_content TEXT,
  post_summary TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  metadata JSONB
);

-- Indexes for performance on post history
CREATE INDEX IF NOT EXISTS idx_post_history_location
  ON automation_post_history(location_id);

CREATE INDEX IF NOT EXISTS idx_post_history_user
  ON automation_post_history(user_id);

CREATE INDEX IF NOT EXISTS idx_post_history_created
  ON automation_post_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_post_history_status
  ON automation_post_history(status);

CREATE INDEX IF NOT EXISTS idx_post_history_location_user
  ON automation_post_history(location_id, user_id);

-- ============================================
-- Table: automation_reply_history
-- Purpose: Track all auto-reply activity
-- ============================================
CREATE TABLE IF NOT EXISTS automation_reply_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  review_id TEXT NOT NULL,
  reviewer_name TEXT,
  review_rating INTEGER CHECK (review_rating >= 1 AND review_rating <= 5),
  review_content TEXT,
  reply_content TEXT,
  status TEXT NOT NULL CHECK (status IN ('success', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  error_message TEXT,
  metadata JSONB
);

-- Indexes for performance on reply history
CREATE INDEX IF NOT EXISTS idx_reply_history_location
  ON automation_reply_history(location_id);

CREATE INDEX IF NOT EXISTS idx_reply_history_user
  ON automation_reply_history(user_id);

CREATE INDEX IF NOT EXISTS idx_reply_history_review
  ON automation_reply_history(review_id);

CREATE INDEX IF NOT EXISTS idx_reply_history_created
  ON automation_reply_history(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reply_history_status
  ON automation_reply_history(status);

CREATE INDEX IF NOT EXISTS idx_reply_history_location_user
  ON automation_reply_history(location_id, user_id);

CREATE INDEX IF NOT EXISTS idx_reply_history_rating
  ON automation_reply_history(review_rating);

-- ============================================
-- Row Level Security (RLS)
-- Purpose: Ensure users can only see their own data
-- ============================================

-- Enable RLS on both tables
ALTER TABLE automation_post_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_reply_history ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view own post history" ON automation_post_history;
DROP POLICY IF EXISTS "Service role can insert post history" ON automation_post_history;
DROP POLICY IF EXISTS "Users can view own reply history" ON automation_reply_history;
DROP POLICY IF EXISTS "Service role can insert reply history" ON automation_reply_history;

-- RLS Policy: Users can view their own post history
CREATE POLICY "Users can view own post history"
  ON automation_post_history
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- RLS Policy: Service role can insert post history
CREATE POLICY "Service role can insert post history"
  ON automation_post_history
  FOR INSERT
  WITH CHECK (true);

-- RLS Policy: Users can view their own reply history
CREATE POLICY "Users can view own reply history"
  ON automation_reply_history
  FOR SELECT
  USING (auth.uid()::text = user_id);

-- RLS Policy: Service role can insert reply history
CREATE POLICY "Service role can insert reply history"
  ON automation_reply_history
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- Grant permissions to service role
-- ============================================
GRANT ALL ON automation_post_history TO service_role;
GRANT ALL ON automation_reply_history TO service_role;

-- ============================================
-- Comments for documentation
-- ============================================
COMMENT ON TABLE automation_post_history IS 'Tracks all auto-posting activity for analytics and transparency';
COMMENT ON TABLE automation_reply_history IS 'Tracks all auto-reply activity for analytics and transparency';

COMMENT ON COLUMN automation_post_history.location_id IS 'Google Business Profile location ID';
COMMENT ON COLUMN automation_post_history.user_id IS 'Firebase user ID who owns this location';
COMMENT ON COLUMN automation_post_history.post_content IS 'Full post content that was created';
COMMENT ON COLUMN automation_post_history.post_summary IS 'Short summary of the post';
COMMENT ON COLUMN automation_post_history.status IS 'success, failed, or pending';
COMMENT ON COLUMN automation_post_history.metadata IS 'Additional data like post_id, topic_type, call_to_action';

COMMENT ON COLUMN automation_reply_history.location_id IS 'Google Business Profile location ID';
COMMENT ON COLUMN automation_reply_history.user_id IS 'Firebase user ID who owns this location';
COMMENT ON COLUMN automation_reply_history.review_id IS 'Google review ID that was replied to';
COMMENT ON COLUMN automation_reply_history.reviewer_name IS 'Name of the person who left the review';
COMMENT ON COLUMN automation_reply_history.review_rating IS 'Star rating (1-5) of the review';
COMMENT ON COLUMN automation_reply_history.review_content IS 'Content of the review';
COMMENT ON COLUMN automation_reply_history.reply_content IS 'AI-generated or custom reply content';
COMMENT ON COLUMN automation_reply_history.status IS 'success or failed';
COMMENT ON COLUMN automation_reply_history.metadata IS 'Additional data like timestamps';

-- ============================================
-- Verification queries
-- ============================================
-- Uncomment to verify tables were created:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'automation_%';
-- SELECT indexname FROM pg_indexes WHERE tablename IN ('automation_post_history', 'automation_reply_history');
