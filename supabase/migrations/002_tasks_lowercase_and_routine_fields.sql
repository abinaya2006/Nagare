alter table public.tasks
  drop constraint if exists tasks_priority_check,
  drop constraint if exists tasks_status_check;

update public.tasks
set
  priority = lower(priority),
  status = lower(status);

alter table public.tasks
  add constraint tasks_priority_check check (priority in ('low', 'medium', 'high')),
  add constraint tasks_status_check check (status in ('pending', 'scheduled', 'completed'));

alter table public.tasks
  alter column status set default 'pending';

alter table public.tasks
  add column if not exists is_routine boolean not null default false,
  add column if not exists recurrence_rule text,
  add column if not exists fixed_start_time time,
  add column if not exists fixed_end_time time;

alter table public.tasks
  drop constraint if exists tasks_fixed_time_block_check,
  add constraint tasks_fixed_time_block_check check (
    (fixed_start_time is null and fixed_end_time is null)
    or (fixed_start_time is not null and fixed_end_time is not null and fixed_end_time > fixed_start_time)
  );

create index if not exists idx_tasks_user_status on public.tasks(user_id, status);
create index if not exists idx_tasks_user_priority on public.tasks(user_id, priority);
