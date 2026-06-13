alter table public.user_preferences
  add column if not exists task_count int;
