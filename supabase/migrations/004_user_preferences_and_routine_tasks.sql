create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  productivity_period text,
  work_style text,
  focus_duration_minutes int,
  break_preference text,
  sleep_hours text,
  task_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id)
);

create table if not exists public.routine_tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 160),
  start_time time not null,
  end_time time not null,
  days text not null default 'daily',
  is_active bool not null default true,
  created_at timestamptz not null default now(),
  check (end_time > start_time)
);

create index if not exists idx_user_preferences_user on public.user_preferences(user_id);
create index if not exists idx_routine_tasks_user_active on public.routine_tasks(user_id, is_active);

alter table public.user_preferences enable row level security;
alter table public.routine_tasks enable row level security;

drop policy if exists "Users can read own preferences" on public.user_preferences;
create policy "Users can read own preferences" on public.user_preferences for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own preferences" on public.user_preferences;
create policy "Users can insert own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own preferences" on public.user_preferences;
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own preferences" on public.user_preferences;
create policy "Users can delete own preferences" on public.user_preferences for delete using (auth.uid() = user_id);

drop policy if exists "Users can read own routine tasks" on public.routine_tasks;
create policy "Users can read own routine tasks" on public.routine_tasks for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own routine tasks" on public.routine_tasks;
create policy "Users can insert own routine tasks" on public.routine_tasks for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own routine tasks" on public.routine_tasks;
create policy "Users can update own routine tasks" on public.routine_tasks for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own routine tasks" on public.routine_tasks;
create policy "Users can delete own routine tasks" on public.routine_tasks for delete using (auth.uid() = user_id);

drop trigger if exists touch_user_preferences_updated_at on public.user_preferences;
create trigger touch_user_preferences_updated_at before update on public.user_preferences
for each row execute function public.touch_updated_at();
