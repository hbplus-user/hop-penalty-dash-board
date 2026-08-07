-- Run this once in the Supabase SQL editor (Project → SQL Editor → New query).
-- It sets up a `profiles` table that stores each signed-in user's role, so the
-- app can read "who is allowed to do what" straight from Supabase.

-- 1. One row per authenticated user, holding their permission role.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'showrunner' check (role in ('showrunner', 'senior_showrunner', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Every signed-in user may read only their own role (not anyone else's).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

-- No insert/update/delete policy is granted to regular users on purpose —
-- roles are assigned by you, running SQL directly (below), which runs with
-- elevated privileges and bypasses RLS. Nobody can self-promote from the app.

-- 2. Auto-create a profile (default role: showrunner) the moment someone
--    signs in for the first time via Google.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'showrunner')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3. Backfill: if anyone already signed in before this migration ran, give
--    them a default profile row too (safe to re-run, it skips existing rows).
insert into public.profiles (id, email, role)
select id, email, 'showrunner' from auth.users
on conflict (id) do nothing;


-- ─────────────────────────────────────────────────────────────
-- Assigning roles: run these any time to promote/demote someone.
-- (Do this in the Supabase SQL editor — there is no in-app UI for it.)
-- ─────────────────────────────────────────────────────────────

-- update public.profiles set role = 'admin'             where email = 'someone@hbplus.fit';
-- update public.profiles set role = 'senior_showrunner'  where email = 'someone-else@hbplus.fit';
-- update public.profiles set role = 'showrunner'         where email = 'new.hire@hbplus.fit';

-- See everyone's current role:
-- select email, role from public.profiles order by email;
