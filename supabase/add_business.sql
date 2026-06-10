-- ─── Kin — Business Accounts Migration ───
-- Run in Supabase → SQL Editor → New query

alter table profiles
  add column if not exists is_business    boolean not null default false,
  add column if not exists business_name  text    not null default '',
  add column if not exists business_type  text    not null default '';
