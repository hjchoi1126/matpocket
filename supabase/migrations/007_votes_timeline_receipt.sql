-- 영수증 인증 필드
alter table public.places
  add column if not exists receipt_verified boolean not null default false;

alter table public.places
  add column if not exists receipt_verified_at timestamptz;

-- 타임라인 메모
create table if not exists public.place_timeline_memos (
  id bigserial primary key,
  place_id bigint not null references public.places(id) on delete cascade,
  user_id uuid,
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists place_timeline_memos_place_id_idx
  on public.place_timeline_memos (place_id, created_at desc);

-- 그룹 투표
create table if not exists public.vote_rooms (
  id uuid primary key default gen_random_uuid(),
  title text not null default '이번 주 회식 어디로?',
  creator_user_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.vote_options (
  id bigserial primary key,
  vote_room_id uuid not null references public.vote_rooms(id) on delete cascade,
  place_id bigint references public.places(id) on delete set null,
  place_name text not null,
  place_address text,
  category text
);

create index if not exists vote_options_room_id_idx
  on public.vote_options (vote_room_id);

create table if not exists public.vote_ballots (
  id bigserial primary key,
  vote_room_id uuid not null references public.vote_rooms(id) on delete cascade,
  vote_option_id bigint not null references public.vote_options(id) on delete cascade,
  voter_token text not null,
  voter_name text,
  created_at timestamptz not null default now(),
  unique (vote_room_id, voter_token)
);

create index if not exists vote_ballots_room_id_idx
  on public.vote_ballots (vote_room_id);

alter table public.place_timeline_memos enable row level security;
alter table public.vote_rooms enable row level security;
alter table public.vote_options enable row level security;
alter table public.vote_ballots enable row level security;

drop policy if exists "timeline_select_anon" on public.place_timeline_memos;
drop policy if exists "timeline_insert_anon" on public.place_timeline_memos;
drop policy if exists "timeline_delete_anon" on public.place_timeline_memos;
drop policy if exists "vote_rooms_select_anon" on public.vote_rooms;
drop policy if exists "vote_rooms_insert_anon" on public.vote_rooms;
drop policy if exists "vote_options_select_anon" on public.vote_options;
drop policy if exists "vote_options_insert_anon" on public.vote_options;
drop policy if exists "vote_ballots_select_anon" on public.vote_ballots;
drop policy if exists "vote_ballots_insert_anon" on public.vote_ballots;
drop policy if exists "vote_ballots_update_anon" on public.vote_ballots;
drop policy if exists "vote_ballots_delete_anon" on public.vote_ballots;

create policy "timeline_select_anon"
  on public.place_timeline_memos for select to anon, authenticated using (true);
create policy "timeline_insert_anon"
  on public.place_timeline_memos for insert to anon, authenticated with check (true);
create policy "timeline_delete_anon"
  on public.place_timeline_memos for delete to anon, authenticated using (true);

create policy "vote_rooms_select_anon"
  on public.vote_rooms for select to anon, authenticated using (true);
create policy "vote_rooms_insert_anon"
  on public.vote_rooms for insert to anon, authenticated with check (true);
create policy "vote_options_select_anon"
  on public.vote_options for select to anon, authenticated using (true);
create policy "vote_options_insert_anon"
  on public.vote_options for insert to anon, authenticated with check (true);
create policy "vote_ballots_select_anon"
  on public.vote_ballots for select to anon, authenticated using (true);
create policy "vote_ballots_insert_anon"
  on public.vote_ballots for insert to anon, authenticated with check (true);
create policy "vote_ballots_update_anon"
  on public.vote_ballots for update to anon, authenticated using (true) with check (true);
create policy "vote_ballots_delete_anon"
  on public.vote_ballots for delete to anon, authenticated using (true);

grant select, insert, update, delete on table public.place_timeline_memos to anon, authenticated;
grant select, insert on table public.vote_rooms to anon, authenticated;
grant select, insert on table public.vote_options to anon, authenticated;
grant select, insert, update, delete on table public.vote_ballots to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
