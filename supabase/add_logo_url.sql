-- Run in Supabase Dashboard → SQL Editor → New Query
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS logo_url TEXT;
