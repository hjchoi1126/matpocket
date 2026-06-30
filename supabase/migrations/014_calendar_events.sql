-- 맛집 일정 달력 (개인 + 공유 폴더)
create table if not exists public.calendar_events (
  id bigserial primary key,
  folder_id bigint references public.folders(id) on delete cascade,
  place_id bigint not null references public.places(id) on delete cascade,
  created_by uuid not null,
  title text not null,
  memo text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists calendar_events_folder_id_idx
  on public.calendar_events (folder_id, starts_at);

create index if not exists calendar_events_starts_at_idx
  on public.calendar_events (starts_at);

create index if not exists calendar_events_created_by_idx
  on public.calendar_events (created_by);

create table if not exists public.calendar_event_rsvps (
  id bigserial primary key,
  event_id bigint not null references public.calendar_events(id) on delete cascade,
  user_id uuid not null,
  display_name text not null default '맛집러',
  status text not null check (status in ('going', 'not_going', 'maybe')),
  updated_at timestamptz not null default now(),
  unique (event_id, user_id)
);

create index if not exists calendar_event_rsvps_event_id_idx
  on public.calendar_event_rsvps (event_id);

alter table public.calendar_events enable row level security;
alter table public.calendar_event_rsvps enable row level security;

drop policy if exists "calendar_events_select_anon" on public.calendar_events;
drop policy if exists "calendar_events_insert_anon" on public.calendar_events;
drop policy if exists "calendar_events_update_anon" on public.calendar_events;
drop policy if exists "calendar_events_delete_anon" on public.calendar_events;

create policy "calendar_events_select_anon"
  on public.calendar_events for select to anon, authenticated using (true);
create policy "calendar_events_insert_anon"
  on public.calendar_events for insert to anon, authenticated with check (true);
create policy "calendar_events_update_anon"
  on public.calendar_events for update to anon, authenticated using (true) with check (true);
create policy "calendar_events_delete_anon"
  on public.calendar_events for delete to anon, authenticated using (true);

drop policy if exists "calendar_rsvps_select_anon" on public.calendar_event_rsvps;
drop policy if exists "calendar_rsvps_insert_anon" on public.calendar_event_rsvps;
drop policy if exists "calendar_rsvps_update_anon" on public.calendar_event_rsvps;
drop policy if exists "calendar_rsvps_delete_anon" on public.calendar_event_rsvps;

create policy "calendar_rsvps_select_anon"
  on public.calendar_event_rsvps for select to anon, authenticated using (true);
create policy "calendar_rsvps_insert_anon"
  on public.calendar_event_rsvps for insert to anon, authenticated with check (true);
create policy "calendar_rsvps_update_anon"
  on public.calendar_event_rsvps for update to anon, authenticated using (true) with check (true);
create policy "calendar_rsvps_delete_anon"
  on public.calendar_event_rsvps for delete to anon, authenticated using (true);

grant select, insert, update, delete on table public.calendar_events to anon, authenticated;
grant select, insert, update, delete on table public.calendar_event_rsvps to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
