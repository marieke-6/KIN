-- Run this FIRST to remove old policies, then run schema.sql

drop policy if exists "profiles: anyone authenticated can read" on profiles;
drop policy if exists "profiles: user inserts own" on profiles;
drop policy if exists "profiles: user updates own" on profiles;

drop policy if exists "communities: readable by all" on communities;

drop policy if exists "community_messages: authenticated can read" on community_messages;
drop policy if exists "community_messages: user inserts own" on community_messages;

drop policy if exists "events: authenticated can read" on events;
drop policy if exists "events: authenticated can create" on events;

drop policy if exists "rsvps: authenticated can read" on rsvps;
drop policy if exists "rsvps: user inserts own" on rsvps;
drop policy if exists "rsvps: user deletes own" on rsvps;

drop policy if exists "event_messages: rsvp members can read while chat is live" on event_messages;
drop policy if exists "event_messages: rsvp members can insert while chat is live" on event_messages;
