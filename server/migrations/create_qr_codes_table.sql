-- Create qr_codes table for storing QR code data
CREATE TABLE IF NOT EXISTS qr_codes (
  code TEXT PRIMARY KEY,
  location_id TEXT NOT NULL,
  location_name TEXT,
  address TEXT,
  user_id TEXT NOT NULL,
  place_id TEXT,
  qr_data_url TEXT,
  review_link TEXT,
  public_review_url TEXT,
  keywords TEXT,
  business_category TEXT,
  scans INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_qr_codes_location_id ON qr_codes(location_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at DESC);

-- Enable RLS (Row Level Security)
ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can insert own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can update own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can delete own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Public can read QR codes" ON qr_codes;

-- Policies
-- Allow users to view their own QR codes
CREATE POLICY "Users can view own QR codes"
  ON qr_codes FOR SELECT
  USING (auth.uid()::text = user_id);

-- Allow users to insert their own QR codes
CREATE POLICY "Users can insert own QR codes"
  ON qr_codes FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- Allow users to update their own QR codes
CREATE POLICY "Users can update own QR codes"
  ON qr_codes FOR UPDATE
  USING (auth.uid()::text = user_id);

-- Allow users to delete their own QR codes
CREATE POLICY "Users can delete own QR codes"
  ON qr_codes FOR DELETE
  USING (auth.uid()::text = user_id);

-- Allow public (non-authenticated) users to read QR codes by code
-- This is needed for the public review page to fetch QR code data
CREATE POLICY "Public can read QR codes"
  ON qr_codes FOR SELECT
  USING (true);

-- Grant permissions to service role
GRANT ALL ON qr_codes TO service_role;

-- Comment
COMMENT ON TABLE qr_codes IS 'Stores QR code data for business locations';
