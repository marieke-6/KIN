-- ─── Recommendations table ───────────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS recommendations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ      DEFAULT now(),
  user_id       UUID             NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title         TEXT             NOT NULL,
  description   TEXT,
  type          TEXT             NOT NULL DEFAULT 'tip',   -- event | offer | tip | place
  location      TEXT,
  city          TEXT,
  event_date    DATE,
  event_time    TIME,
  image_url     TEXT,
  website       TEXT,
  business_name TEXT,
  is_featured   BOOLEAN          DEFAULT false
);

ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recommendations"
  ON recommendations FOR SELECT USING (true);

CREATE POLICY "Users can insert own recommendations"
  ON recommendations FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations"
  ON recommendations FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recommendations"
  ON recommendations FOR DELETE USING (auth.uid() = user_id);

-- ─── Storage bucket for recommendation photos ────────────────────────────────
-- In Supabase Dashboard → Storage → New bucket:
--   Name: recommendations
--   Public: YES (toggle on)
--
-- Then add this storage policy in Storage → recommendations → Policies:
--   Policy name: "Auth users can upload"
--   Allowed operation: INSERT
--   Target roles: authenticated
--   WITH CHECK: true
