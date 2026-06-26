-- ============================================================
-- places 테이블 스키마 보정 (저장 실패 시 실행)
-- 기존에 다른 구조로 places가 만들어져 있으면 컬럼만 추가합니다.
-- ============================================================

alter table public.places add column if not exists user_id uuid;
alter table public.places add column if not exists place_name text;
alter table public.places add column if not exists address text;
alter table public.places add column if not exists latitude double precision;
alter table public.places add column if not exists longitude double precision;
alter table public.places add column if not exists category text;
alter table public.places add column if not exists memo text;
alter table public.places add column if not exists tags text[] default '{}';
alter table public.places add column if not exists link_url text;
alter table public.places add column if not exists is_public boolean default false;
alter table public.places add column if not exists created_at timestamptz default now();

-- 예전 컬럼명(name, lat, lng)이 있으면 새 컬럼으로 복사
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'places' and column_name = 'name'
  ) then
    execute 'update public.places set place_name = name where place_name is null and name is not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'places' and column_name = 'lat'
  ) then
    execute 'update public.places set latitude = lat where latitude is null and lat is not null';
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'places' and column_name = 'lng'
  ) then
    execute 'update public.places set longitude = lng where longitude is null and lng is not null';
  end if;
end $$;

update public.places set tags = '{}' where tags is null;
update public.places set is_public = false where is_public is null;

alter table public.places enable row level security;

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

-- 현재 컬럼 목록 확인
select column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public' and table_name = 'places'
order by ordinal_position;
