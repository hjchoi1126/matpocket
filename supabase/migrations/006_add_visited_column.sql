-- 발도장(방문 체크인) 컬럼 추가
alter table public.places
  add column if not exists visited boolean not null default false;

create index if not exists places_visited_idx on public.places (visited);

-- 반환 타입(visited 추가)이 바뀌므로 기존 함수를 먼저 삭제
drop function if exists public.nearby_places(double precision, double precision, double precision);

-- nearby_places RPC에 visited 컬럼 반영
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
