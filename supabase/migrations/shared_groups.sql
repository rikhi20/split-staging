/*
====================================================
MIGRATION VERSION 4 — FINAL SHARED GROUP SCHEMA
Supports:
• Groups
• Multiple members
• Shared expenses
• Proper paid_by handling
• Settle up support
====================================================
*/

----------------------------------------------------
-- EXTENSIONS
----------------------------------------------------

create extension if not exists "pgcrypto";


----------------------------------------------------
-- GROUPS TABLE
----------------------------------------------------

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);


----------------------------------------------------
-- GROUP MEMBERS TABLE
----------------------------------------------------

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),

  group_id uuid not null references public.groups(id) on delete cascade,

  user_id uuid not null references auth.users(id) on delete cascade,

  created_at timestamptz default now(),

  unique(group_id, user_id)
);


----------------------------------------------------
-- EXPENSES TABLE
----------------------------------------------------

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),

  group_id uuid not null references public.groups(id) on delete cascade,

  description text not null,

  amount numeric(10,2) not null check (amount > 0),

  paid_by uuid not null references auth.users(id),

  created_by uuid not null references auth.users(id),

  created_at timestamptz default now()
);


----------------------------------------------------
-- EXPENSE SPLITS TABLE
-- defines who owes what for each expense
----------------------------------------------------

create table if not exists public.expense_splits (
  id uuid primary key default gen_random_uuid(),

  expense_id uuid not null references public.expenses(id) on delete cascade,

  user_id uuid not null references auth.users(id) on delete cascade,

  amount numeric(10,2) not null check (amount >= 0),

  created_at timestamptz default now(),

  unique(expense_id, user_id)
);


----------------------------------------------------
-- ENABLE RLS
----------------------------------------------------

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.expenses enable row level security;
alter table public.expense_splits enable row level security;


----------------------------------------------------
-- GROUP POLICIES
----------------------------------------------------

create policy "Users can view their groups"
on public.groups
for select
using (
  exists (
    select 1 from public.group_members
    where group_members.group_id = groups.id
    and group_members.user_id = auth.uid()
  )
);

create policy "Users can create groups"
on public.groups
for insert
with check (true);


----------------------------------------------------
-- GROUP MEMBERS POLICIES
----------------------------------------------------

create policy "Users can view members of their groups"
on public.group_members
for select
using (
  user_id = auth.uid()
  or
  exists (
    select 1 from public.group_members gm
    where gm.group_id = group_members.group_id
    and gm.user_id = auth.uid()
  )
);

create policy "Users can insert themselves into groups"
on public.group_members
for insert
with check (user_id = auth.uid());


----------------------------------------------------
-- EXPENSE POLICIES
----------------------------------------------------

create policy "Users can view group expenses"
on public.expenses
for select
using (
  exists (
    select 1 from public.group_members
    where group_members.group_id = expenses.group_id
    and group_members.user_id = auth.uid()
  )
);

create policy "Users can create expenses"
on public.expenses
for insert
with check (
  exists (
    select 1 from public.group_members
    where group_members.group_id = expenses.group_id
    and group_members.user_id = auth.uid()
  )
);

create policy "Users can delete their created expenses"
on public.expenses
for delete
using (created_by = auth.uid());


----------------------------------------------------
-- EXPENSE SPLITS POLICIES
----------------------------------------------------

create policy "Users can view splits"
on public.expense_splits
for select
using (
  exists (
    select 1
    from public.expenses
    join public.group_members
    on group_members.group_id = expenses.group_id
    where expenses.id = expense_splits.expense_id
    and group_members.user_id = auth.uid()
  )
);

create policy "Users can insert splits"
on public.expense_splits
for insert
with check (true);


----------------------------------------------------
-- HELPER VIEW: BALANCES
-- Used for settle up calculation
----------------------------------------------------

create or replace view public.group_balances as
select
  gm.group_id,
  gm.user_id,

  coalesce(sum(
    case when e.paid_by = gm.user_id then e.amount else 0 end
  ),0)
  -
  coalesce(sum(es.amount),0)
  as balance

from public.group_members gm

left join public.expenses e
on e.group_id = gm.group_id

left join public.expense_splits es
on es.user_id = gm.user_id

group by gm.group_id, gm.user_id;


----------------------------------------------------
-- DONE
----------------------------------------------------
