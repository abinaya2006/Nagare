alter table public.schedules
  add column if not exists unscheduled_items jsonb not null default '[]'::jsonb;
