-- 공유 프로필 (닉네임 + 리스트 공개 여부)
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
  on public.share_profiles for select
  to anon, authenticated
  using (true);

create policy "share_profiles_insert_anon"
  on public.share_profiles for insert
  to anon, authenticated
  with check (true);

create policy "share_profiles_update_anon"
  on public.share_profiles for update
  to anon, authenticated
  using (true)
  with check (true);
