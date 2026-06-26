-- 맛포켓: 저장 맛집 테이블
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  kakao_place_id text not null unique,
  name text not null,
  address text,
  road_address text,
  phone text,
  category text,
  lat double precision not null,
  lng double precision not null,
  place_url text,
  memo text,
  created_at timestamptz not null default now()
);

create index if not exists restaurants_created_at_idx
  on public.restaurants (created_at desc);

alter table public.restaurants enable row level security;

create policy "restaurants_select_anon"
  on public.restaurants for select
  to anon, authenticated
  using (true);

create policy "restaurants_insert_anon"
  on public.restaurants for insert
  to anon, authenticated
  with check (true);

create policy "restaurants_delete_anon"
  on public.restaurants for delete
  to anon, authenticated
  using (true);
