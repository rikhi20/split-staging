/*
==================================================
V4 MIGRATION (UPGRADE SAFE)
Adds group support and proper settlements
==================================================
*/

--------------------------------------------------
-- 1. GROUPS
--------------------------------------------------

create table if not exists groups (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Shared Expenses',
  created_at timestamptz default now()
);


--------------------------------------------------
-- 2. GROUP MEMBERS
--------------------------------------------------

create table if not exists group_members (
  id uuid primary key default gen_random_uuid(),

  group_id uuid references groups(id) on delete cascade,

  user_id uuid references auth.users(id) on delete cascade,

  role text default 'member',

  created_at timestamptz default now(),

  unique(group_id, user_id)
);


--------------------------------------------------
-- 3. ADD NEW COLUMNS TO EXPENSES
--------------------------------------------------

alter table expenses
add column if not exists group_id uuid references groups(id) on delete cascade;

alter table expenses
add column if not exists created_by uuid references auth.users(id);

alter table expenses
add column if not exists updated_at timestamptz default now();


--------------------------------------------------
-- 4. EXPENSE SPLITS TABLE
--------------------------------------------------

create table if not exists expense_splits (

  id uuid primary key default gen_random_uuid(),

  expense_id uuid references expenses(id) on delete cascade,

  user_id uuid references auth.users(id),

  amount numeric not null,

  created_at timestamptz default now()

);


--------------------------------------------------
-- 5. FIX SETTLEMENTS TABLE
--------------------------------------------------

alter table settlements
add column if not exists group_id uuid references groups(id) on delete cascade;

alter table settlements
add column if not exists paid_by_user uuid references auth.users(id);

alter table settlements
add column if not exists paid_to_user uuid references auth.users(id);

alter table settlements
add column if not exists created_at timestamptz default now();


--------------------------------------------------
-- 6. REMOVE OLD BROKEN COLUMNS (optional cleanup)
--------------------------------------------------

-- comment these if you want to keep old compatibility

alter table settlements drop column if exists paid_by;
alter table settlements drop column if exists paid_to;


--------------------------------------------------
-- DONE
--------------------------------------------------
