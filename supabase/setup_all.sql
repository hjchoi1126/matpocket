-- ============================================================
-- 맛포켓 Supabase 초기 설정 (이 파일 전체를 한 번에 실행하세요)
-- Supabase 대시보드 → SQL Editor → New query → 붙여넣기 → Run
-- ============================================================

-- 1) places 테이블
create table if not exists public.places (
  id bigserial primary key,
  user_id uuid,
  place_name text not null,
  address text,
  latitude double precision,
  longitude double precision,
  category text,
  memo text,
  tags text[] not null default '{}',
  link_url text,
  is_public boolean not null default false,
  visited boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists places_user_id_idx on public.places (user_id);
create index if not exists places_created_at_idx on public.places (created_at desc);
create index if not exists places_tags_idx on public.places using gin (tags);
create index if not exists places_location_idx
  on public.places (latitude, longitude)
  where latitude is not null and longitude is not null;

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

-- 2) share_profiles 테이블
create table if not exists public.share_profiles (
  user_id uuid primary key,
  display_name text not null default '맛집러',
  is_list_public boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.share_profiles enable row level security;

drop policy if exists "share_profiles_select_anon" on public.share_profiles;
drop policy if exists "share_profiles_insert_anon" on public.share_profiles;
drop policy if exists "share_profiles_update_anon" on public.share_profiles;

create policy "share_profiles_select_anon"
  on public.share_profiles for select to anon, authenticated using (true);

create policy "share_profiles_insert_anon"
  on public.share_profiles for insert to anon, authenticated with check (true);

create policy "share_profiles_update_anon"
  on public.share_profiles for update to anon, authenticated using (true) with check (true);

-- 3) nearby_places RPC (places 테이블이 있어야 성공합니다)
drop function if exists public.nearby_places(double precision, double precision, double precision);

create function public.nearby_places(
  p_lat double precision,
  p_lng double precision,
  p_radius_km double precision default 1
)
returns table (
  id bigint,
  user_id uuid,
  place_name text,
  address text,
  latitude double precision,
  longitude double precision,
  category text,
  memo text,
  tags text[],
  link_url text,
  is_public boolean,
  visited boolean,
  created_at timestamptz,
  distance_km double precision
)
language sql
stable
as $$
  select
    p.id,
    p.user_id,
    p.place_name,
    p.address,
    p.latitude,
    p.longitude,
    p.category,
    p.memo,
    p.tags,
    p.link_url,
    p.is_public,
    p.visited,
    p.created_at,
    (
      6371 * acos(
        least(
          1.0,
          greatest(
            -1.0,
            cos(radians(p_lat)) * cos(radians(p.latitude)) *
            cos(radians(p.longitude) - radians(p_lng)) +
            sin(radians(p_lat)) * sin(radians(p.latitude))
          )
        )
      )
    ) as distance_km
  from public.places p
  where p.latitude is not null
    and p.longitude is not null
    and (
      6371 * acos(
        least(
          1.0,
          greatest(
            -1.0,
            cos(radians(p_lat)) * cos(radians(p.latitude)) *
            cos(radians(p.longitude) - radians(p_lng)) +
            sin(radians(p_lat)) * sin(radians(p.latitude))
          )
        )
      )
    ) <= p_radius_km
  order by distance_km asc;
$$;

grant execute on function public.nearby_places(double precision, double precision, double precision)
  to anon, authenticated;

-- 4) 테이블 권한 부여 (permission denied 방지)
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public.places to anon, authenticated;
grant select, insert, update, delete on table public.share_profiles to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated, service_role;

-- 6) 투표·타임라인·영수증 (007) — supabase/migrations/007_votes_timeline_receipt.sql 참고

-- 7) 저장 폴더 (008) — supabase/migrations/008_folders.sql 참고

-- 8) 투표 upsert 권한 (009) — supabase/migrations/009_fix_vote_ballots_permissions.sql 참고

-- 5) 생성 확인
select 'places 테이블' as check_item,
  exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'places'
  ) as ok;

select 'nearby_places 함수' as check_item,
  exists (
    select 1 from pg_proc
    join pg_namespace n on n.oid = pg_proc.pronamespace
    where n.nspname = 'public' and pg_proc.proname = 'nearby_places'
  ) as ok;
