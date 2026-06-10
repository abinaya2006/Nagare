create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  description text default '',
  deadline timestamptz,
  estimated_duration_minutes integer not null check (estimated_duration_minutes between 5 and 1440),
  priority text not null check (priority in ('Low', 'Medium', 'High')),
  status text not null default 'Pending' check (status in ('Pending', 'Scheduled', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schedules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  schedule_date date not null default current_date,
  items jsonb not null default '[]'::jsonb,
  source text not null default 'ai',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_tasks_user_deadline on public.tasks(user_id, deadline);
create index if not exists idx_schedules_user_date on public.schedules(user_id, schedule_date desc);

alter table public.users enable row level security;
alter table public.tasks enable row level security;
alter table public.schedules enable row level security;

create policy "Users can read own profile" on public.users for select using (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);

create policy "Users can read own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

create policy "Users can read own schedules" on public.schedules for select using (auth.uid() = user_id);
create policy "Users can insert own schedules" on public.schedules for insert with check (auth.uid() = user_id);
create policy "Users can update own schedules" on public.schedules for update using (auth.uid() = user_id);
create policy "Users can delete own schedules" on public.schedules for delete using (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists touch_users_updated_at on public.users;
create trigger touch_users_updated_at before update on public.users
for each row execute function public.touch_updated_at();

drop trigger if exists touch_tasks_updated_at on public.tasks;
create trigger touch_tasks_updated_at before update on public.tasks
for each row execute function public.touch_updated_at();

drop trigger if exists touch_schedules_updated_at on public.schedules;
create trigger touch_schedules_updated_at before update on public.schedules
for each row execute function public.touch_updated_at();

