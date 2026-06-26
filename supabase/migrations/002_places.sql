-- 맛포켓: places 테이블 (링크 스크랩, 태그, 위치 기반 조회)
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
  on public.places for select
  to anon, authenticated
  using (true);

create policy "places_insert_anon"
  on public.places for insert
  to anon, authenticated
  with check (true);

create policy "places_update_anon"
  on public.places for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "places_delete_anon"
  on public.places for delete
  to anon, authenticated
  using (true);

-- Haversine 기반 주변 맛집 조회 RPC
create or replace function public.nearby_places(
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
