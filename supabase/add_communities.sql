-- ─── Kin — Community Creation Migration ───
-- Run this in Supabase → SQL Editor → New query

-- Add user-creation fields to communities
alter table communities
  add column if not exists created_by  uuid references auth.users on delete set null,
  add column if not exists city        text not null default 'Vienna',
  add column if not exists description text not null default '',
  add column if not exists is_seeded   boolean not null default false;

-- Mark the three seeded communities
update communities set is_seeded = true
where id in ('board-games', 'running', 'painting');

-- Allow authenticated users to insert new communities
drop policy if exists "communities_insert" on communities;
create policy "communities_insert" on communities
  for insert to authenticated
  with check (auth.uid() = created_by);

-- Community members (who has joined which community)
create table if not exists community_members (
  id           uuid        primary key default gen_random_uuid(),
  community_id text        not null references communities(id) on delete cascade,
  user_id      uuid        not null references auth.users on delete cascade,
  joined_at    timestamptz not null default now(),
  unique (community_id, user_id)
);

alter table community_members enable row level security;

drop policy if exists "community_members_select" on community_members;
drop policy if exists "community_members_insert" on community_members;
drop policy if exists "community_members_delete" on community_members;

create policy "community_members_select" on community_members
  for select to authenticated using (true);

create policy "community_members_insert" on community_members
  for insert to authenticated with check (auth.uid() = user_id);

create policy "community_members_delete" on community_members
  for delete to authenticated using (auth.uid() = user_id);
