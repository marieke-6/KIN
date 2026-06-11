-- Run in Supabase Dashboard → SQL Editor → New Query

CREATE TABLE IF NOT EXISTS event_waitlist (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now(),
  event_id   UUID        NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id    UUID        NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(event_id, user_id)
);

ALTER TABLE event_waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view waitlist counts" ON event_waitlist
  FOR SELECT USING (true);

CREATE POLICY "Users can join waitlist" ON event_waitlist
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave waitlist" ON event_waitlist
  FOR DELETE USING (auth.uid() = user_id);
