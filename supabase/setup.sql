-- ─── Kin — Full Setup (safe to run once) ───────────────────────────────────
-- Paste this entire file into Supabase → SQL Editor → New query → Run

-- ── Drop old policies if they exist (cleanup from any previous run) ──────────
drop policy if exists "profiles: anyone authenticated can read" on profiles;
drop policy if exists "profiles: user inserts own" on profiles;
drop policy if exists "profiles: user updates own" on profiles;
drop policy if exists "profiles_select" on profiles;
drop policy if exists "profiles_insert" on profiles;
drop policy if exists "profiles_update" on profiles;

drop policy if exists "communities: readable by all" on communities;
drop policy if exists "communities_select" on communities;

drop policy if exists "community_messages: authenticated can read" on community_messages;
drop policy if exists "community_messages: user inserts own" on community_messages;
drop policy if exists "community_messages_select" on community_messages;
drop policy if exists "community_messages_insert" on community_messages;

drop policy if exists "events: authenticated can read" on events;
drop policy if exists "events: authenticated can create" on events;
drop policy if exists "events_select" on events;
drop policy if exists "events_insert" on events;

drop policy if exists "rsvps: authenticated can read" on rsvps;
drop policy if exists "rsvps: user inserts own" on rsvps;
drop policy if exists "rsvps: user deletes own" on rsvps;
drop policy if exists "rsvps_select" on rsvps;
drop policy if exists "rsvps_insert" on rsvps;
drop policy if exists "rsvps_delete" on rsvps;

drop policy if exists "event_messages: rsvp members can read while chat is live" on event_messages;
drop policy if exists "event_messages: rsvp members can insert while chat is live" on event_messages;
drop policy if exists "event_messages_select" on event_messages;
drop policy if exists "event_messages_insert" on event_messages;


-- ── 1. Profiles ───────────────────────────────────────────────────────────────
create table if not exists profiles (
  id           uuid primary key references auth.users on delete cascade,
  name         text        not null,
  city         text        not null default 'Vienna',
  interests    text[]      not null default '{}',
  avatar_color text        not null default 'sage',
  created_at   timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "profiles_select" on profiles for select to authenticated using (true);
create policy "profiles_insert" on profiles for insert to authenticated with check (auth.uid() = id);
create policy "profiles_update" on profiles for update to authenticated using (auth.uid() = id);


-- ── 2. Communities ────────────────────────────────────────────────────────────
create table if not exists communities (
  id    text primary key,
  name  text not null,
  icon  text not null,
  color text not null
);

alter table communities enable row level security;

create policy "communities_select" on communities for select using (true);

insert into communities (id, name, icon, color) values
  ('board-games', 'Board games', 'ti-chess',  'amber'),
  ('running',     'Running',     'ti-run',     'sage'),
  ('painting',    'Painting',    'ti-palette', 'lav')
on conflict (id) do nothing;


-- ── 3. Community messages ─────────────────────────────────────────────────────
create table if not exists community_messages (
  id           uuid        primary key default gen_random_uuid(),
  community_id text        not null references communities(id),
  city         text        not null,
  user_id      uuid        not null references auth.users on delete cascade,
  text         text        not null,
  created_at   timestamptz not null default now()
);

alter table community_messages enable row level security;

create policy "community_messages_select" on community_messages for select to authenticated using (true);
create policy "community_messages_insert" on community_messages for insert to authenticated with check (auth.uid() = user_id);


-- ── 4. Events ─────────────────────────────────────────────────────────────────
create table if not exists events (
  id              uuid        primary key default gen_random_uuid(),
  community_id    text        not null references communities(id),
  city            text        not null,
  title           text        not null,
  event_date      date        not null,
  event_time      time        not null,
  max_attendees   int         not null default 8,
  district        text        not null,
  full_address    text        not null,
  address_note    text        not null default '',
  created_by      uuid        references auth.users on delete set null,
  created_at      timestamptz not null default now(),
  chat_expires_at timestamptz
);

alter table events enable row level security;

create policy "events_select" on events for select to authenticated using (true);
create policy "events_insert" on events for insert to authenticated with check (auth.uid() = created_by);


-- ── 5. RSVPs ──────────────────────────────────────────────────────────────────
create table if not exists rsvps (
  id         uuid        primary key default gen_random_uuid(),
  event_id   uuid        not null references events(id) on delete cascade,
  user_id    uuid        not null references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  unique (event_id, user_id)
);

alter table rsvps enable row level security;

create policy "rsvps_select" on rsvps for select to authenticated using (true);
create policy "rsvps_insert" on rsvps for insert to authenticated with check (auth.uid() = user_id);
create policy "rsvps_delete" on rsvps for delete to authenticated using (auth.uid() = user_id);


-- ── 6. Event messages (private, RSVP-gated, auto-expiring) ───────────────────
create table if not exists event_messages (
  id         uuid        primary key default gen_random_uuid(),
  event_id   uuid        not null references events(id) on delete cascade,
  user_id    uuid        not null references auth.users on delete cascade,
  text       text        not null,
  created_at timestamptz not null default now()
);

alter table event_messages enable row level security;

create policy "event_messages_select" on event_messages for select to authenticated
  using (
    exists (
      select 1 from rsvps r
      where r.event_id = event_messages.event_id
        and r.user_id  = auth.uid()
    )
    and exists (
      select 1 from events e
      where e.id = event_messages.event_id
        and (e.chat_expires_at is null or e.chat_expires_at > now())
    )
  );

create policy "event_messages_insert" on event_messages for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from rsvps r
      where r.event_id = event_messages.event_id
        and r.user_id  = auth.uid()
    )
    and exists (
      select 1 from events e
      where e.id = event_messages.event_id
        and (e.chat_expires_at is null or e.chat_expires_at > now())
    )
  );
