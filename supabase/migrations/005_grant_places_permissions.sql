-- ============================================================
-- places 테이블 권한 부여 (permission denied 해결)
-- 에러: permission denied for table places
-- ============================================================

grant usage on schema public to anon, authenticated, service_role;

grant select, insert, update, delete on table public.places to anon, authenticated;
grant all on table public.places to service_role;

grant select, insert, update, delete on table public.share_profiles to anon, authenticated;
grant all on table public.share_profiles to service_role;

-- bigserial id 시퀀스 권한 (없으면 insert 시 실패할 수 있음)
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- RLS 정책 재확인
alter table public.places enable row level security;
alter table public.share_profiles enable row level security;

drop policy if exists "places_select_anon" on public.places;
drop policy if exists "places_insert_anon" on public.places;
drop policy if exists "places_update_anon" on public.places;
drop policy if exists "places_delete_anon" on public.places;

create policy "places_select_anon"
  on public.places for select to anon, authenticated using (true);

create policy "places_insert_anon"
  on public.places for insert to anon, authenticated with check (true);

create policy "places_update_anon"
  on public.places for update to anon, authenticated using (true) with check (true);

create policy "places_delete_anon"
  on public.places for delete to anon, authenticated using (true);

drop policy if exists "share_profiles_select_anon" on public.share_profiles;
drop policy if exists "share_profiles_insert_anon" on public.share_profiles;
drop policy if exists "share_profiles_update_anon" on public.share_profiles;

create policy "share_profiles_select_anon"
  on public.share_profiles for select to anon, authenticated using (true);

create policy "share_profiles_insert_anon"
  on public.share_profiles for insert to anon, authenticated with check (true);

create policy "share_profiles_update_anon"
  on public.share_profiles for update to anon, authenticated using (true) with check (true);
