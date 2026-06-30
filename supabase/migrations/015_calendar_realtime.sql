-- 달력 실시간 동기화 (Supabase Realtime)
-- Supabase SQL Editor에서 014 실행 후 이 파일도 실행해 주세요.

alter table public.calendar_events replica identity full;
alter table public.calendar_event_rsvps replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'calendar_events'
  ) then
    alter publication supabase_realtime add table public.calendar_events;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'calendar_event_rsvps'
  ) then
    alter publication supabase_realtime add table public.calendar_event_rsvps;
  end if;
end $$;
