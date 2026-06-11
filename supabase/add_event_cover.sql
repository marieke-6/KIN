-- Run in Supabase Dashboard → SQL Editor → New Query
ALTER TABLE events ADD COLUMN IF NOT EXISTS icon       TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS icon_color TEXT DEFAULT 'sage';
ALTER TABLE events ADD COLUMN IF NOT EXISTS cover_url  TEXT;

-- Photos are stored in the existing 'recommendations' bucket under events/ prefix.
-- No new bucket needed — the existing storage policies already allow authenticated uploads.
