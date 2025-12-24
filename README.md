# HouseTask

HouseTask is a shared household task manager with daily/weekly checklists, grocery list, and history tracking for multiple users.

## Features
- Daily and weekly tasks with per-user completion
- Monthly and daily history with points
- Shared groceries list with quantity, notes, and share/export
- Add-again flow from recent grocery lists
- Admin actions (reset completions, reset tasks, remove members)

## Tech
- Vite + React
- Supabase Auth + Postgres

## Setup
1) Install dependencies:
```
npm install
```

2) Run the dev server:
```
npm run dev
```

3) Run unit tests:
```
npm run test
```

## Supabase schema
Run these in Supabase SQL editor.

### Core tables
```
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  avatar text not null,
  color text not null,
  household_id text not null default 'default',
  role text not null default 'member',
  created_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  icon text not null,
  color text not null,
  household_id text not null default 'default',
  created_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category_id uuid references public.categories(id) on delete set null,
  completed_by uuid[] not null default '{}',
  frequency text not null check (frequency in ('daily','weekly')),
  rating int not null default 1,
  household_id text not null default 'default',
  created_at timestamptz not null default now()
);

create table if not exists public.completion_events (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  completed boolean not null,
  occurred_at timestamptz not null default now(),
  household_id text not null default 'default'
);
```

### Groceries tables
```
create table if not exists public.groceries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  quantity int not null default 1,
  note text not null default '',
  completed boolean not null default false,
  household_id text not null default 'default',
  created_at timestamptz not null default now()
);

create table if not exists public.groceries_archives (
  id uuid primary key default gen_random_uuid(),
  household_id text not null default 'default',
  created_at timestamptz not null default now()
);

create table if not exists public.groceries_archive_items (
  id uuid primary key default gen_random_uuid(),
  archive_id uuid not null references public.groceries_archives(id) on delete cascade,
  name text not null,
  quantity int not null default 1,
  note text not null default ''
);
```

### RLS policies
```
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tasks enable row level security;
alter table public.completion_events enable row level security;
alter table public.groceries enable row level security;
alter table public.groceries_archives enable row level security;
alter table public.groceries_archive_items enable row level security;

drop policy if exists "profiles_read_household" on public.profiles;
create policy "profiles_read_household"
  on public.profiles for select
  to authenticated
  using (household_id = 'default');

drop policy if exists "profiles_insert_self" on public.profiles;
create policy "profiles_insert_self"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid() and household_id = 'default');

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

drop policy if exists "profiles_delete_admin" on public.profiles;
create policy "profiles_delete_admin"
  on public.profiles for delete
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.household_id = 'default'
    )
  );

drop policy if exists "profiles_update_admin" on public.profiles;
create policy "profiles_update_admin"
  on public.profiles for update
  to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.household_id = 'default'
    )
  )
  with check (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role = 'admin'
        and p.household_id = 'default'
    )
  );

drop policy if exists "categories_all_household" on public.categories;
create policy "categories_all_household"
  on public.categories for all
  to authenticated
  using (household_id = 'default')
  with check (household_id = 'default');

drop policy if exists "tasks_all_household" on public.tasks;
create policy "tasks_all_household"
  on public.tasks for all
  to authenticated
  using (household_id = 'default')
  with check (household_id = 'default');

drop policy if exists "completion_events_all_household" on public.completion_events;
create policy "completion_events_all_household"
  on public.completion_events for all
  to authenticated
  using (household_id = 'default')
  with check (household_id = 'default');

drop policy if exists "groceries_all_household" on public.groceries;
create policy "groceries_all_household"
  on public.groceries for all
  to authenticated
  using (household_id = 'default')
  with check (household_id = 'default');

drop policy if exists "groceries_archives_all_household" on public.groceries_archives;
create policy "groceries_archives_all_household"
  on public.groceries_archives for all
  to authenticated
  using (household_id = 'default')
  with check (household_id = 'default');

drop policy if exists "groceries_archive_items_all_household" on public.groceries_archive_items;
create policy "groceries_archive_items_all_household"
  on public.groceries_archive_items for all
  to authenticated
  using (
    exists (
      select 1 from public.groceries_archives a
      where a.id = groceries_archive_items.archive_id
        and a.household_id = 'default'
    )
  )
  with check (
    exists (
      select 1 from public.groceries_archives a
      where a.id = groceries_archive_items.archive_id
        and a.household_id = 'default'
    )
  );
```

## Deployment
### Vercel
- Build: `npm run build`
- Output dir: `dist`
- Set Supabase **Auth → URL Configuration → Site URL** to your Vercel production URL.
- Disable email confirmation if you do not have SMTP configured.

## Notes
- Admin email: `vedad.hadzihasanovic@gmail.com` (set on registration).
