-- Run this once in the Supabase SQL editor, AFTER roles.sql has already been run.
-- It moves incidents / incentives / rule settings out of each browser's
-- localStorage and into shared tables, so every signed-in user (and every
-- device) sees the same live data — enforced by the same role rules as the
-- app UI, but now at the database level via RLS.

-- Lets policies below ask "what role is the calling user?" without
-- re-triggering profiles' own RLS recursively.
create or replace function public.current_role()
returns text
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 1. Employees roster (who incidents/incentives are tracked against).
create table if not exists public.employees (
  id text primary key,
  name text not null,
  created_at timestamptz not null default now()
);

-- 2. Incidents.
create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  employee_id text not null references public.employees(id) on delete cascade,
  date date not null,
  category text not null check (category in ('Low', 'Medium', 'Critical')),
  description text not null,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- 3. Incentives: one row per employee per payroll month.
create table if not exists public.incentives (
  employee_id text not null references public.employees(id) on delete cascade,
  month text not null, -- 'YYYY-MM'
  retention text not null default 'none' check (retention in ('none','base','excellence')),
  reviews text not null default 'none' check (reviews in ('none','base','excellence')),
  attendance text not null default 'none' check (attendance in ('none','base','excellence')),
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  primary key (employee_id, month)
);

-- 4. Rule settings: single row holding the admin-customizable amounts as JSON.
create table if not exists public.rule_settings (
  id int primary key default 1,
  settings jsonb not null,
  updated_by uuid references auth.users(id),
  updated_at timestamptz not null default now(),
  constraint rule_settings_singleton check (id = 1)
);

alter table public.employees enable row level security;
alter table public.incidents enable row level security;
alter table public.incentives enable row level security;
alter table public.rule_settings enable row level security;

-- Employees: readable by any signed-in user with a role (no write UI exists yet).
drop policy if exists "employees_select_all" on public.employees;
create policy "employees_select_all" on public.employees for select
  using (public.current_role() is not null);

-- Incidents: everyone reads and adds; only Senior Showrunner/Admin edit or delete.
drop policy if exists "incidents_select_all" on public.incidents;
create policy "incidents_select_all" on public.incidents for select
  using (public.current_role() is not null);

drop policy if exists "incidents_insert_all" on public.incidents;
create policy "incidents_insert_all" on public.incidents for insert
  with check (public.current_role() is not null);

drop policy if exists "incidents_update_privileged" on public.incidents;
create policy "incidents_update_privileged" on public.incidents for update
  using (public.current_role() in ('senior_showrunner', 'admin'));

drop policy if exists "incidents_delete_privileged" on public.incidents;
create policy "incidents_delete_privileged" on public.incidents for delete
  using (public.current_role() in ('senior_showrunner', 'admin'));

-- Incentives: everyone reads; only Senior Showrunner/Admin set levels.
drop policy if exists "incentives_select_all" on public.incentives;
create policy "incentives_select_all" on public.incentives for select
  using (public.current_role() is not null);

drop policy if exists "incentives_insert_privileged" on public.incentives;
create policy "incentives_insert_privileged" on public.incentives for insert
  with check (public.current_role() in ('senior_showrunner', 'admin'));

drop policy if exists "incentives_update_privileged" on public.incentives;
create policy "incentives_update_privileged" on public.incentives for update
  using (public.current_role() in ('senior_showrunner', 'admin'));

-- Rule settings: everyone reads; only Admin edits.
drop policy if exists "rule_settings_select_all" on public.rule_settings;
create policy "rule_settings_select_all" on public.rule_settings for select
  using (public.current_role() is not null);

drop policy if exists "rule_settings_update_admin" on public.rule_settings;
create policy "rule_settings_update_admin" on public.rule_settings for update
  using (public.current_role() = 'admin');

-- Seed the employee roster (safe to re-run).
insert into public.employees (id, name) values
  ('e1', 'Aditi Sharma'),
  ('e2', 'Rohan Verma'),
  ('e3', 'Priya Nair'),
  ('e4', 'Karan Mehta'),
  ('e5', 'Sana Iqbal')
on conflict (id) do nothing;

-- Seed the single rule-settings row with today's defaults (safe to re-run).
insert into public.rule_settings (id, settings) values (
  1,
  '{"strikeValues":{"Low":1,"Medium":3,"Critical":5},"bandAmounts":[500,1000,1500,2000,4000],"pillarPayout":{"none":0,"base":500,"excellence":1000},"fullHouseBonus":500}'::jsonb
)
on conflict (id) do nothing;

-- Turn on live sync: pushes inserts/updates/deletes to every connected
-- browser instantly. If this errors ("already a member"), it's already on —
-- ignore it. If it errors for another reason, enable it instead via
-- Supabase Dashboard → Database → Replication → toggle these 3 tables.
alter publication supabase_realtime add table public.incidents;
alter publication supabase_realtime add table public.incentives;
alter publication supabase_realtime add table public.rule_settings;
