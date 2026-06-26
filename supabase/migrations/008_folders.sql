-- 저장 폴더
create table if not exists public.folders (
  id bigserial primary key,
  user_id uuid,
  name text not null,
  created_at timestamptz not null default now()
);

create index if not exists folders_user_id_idx
  on public.folders (user_id, created_at desc);

alter table public.places
  add column if not exists folder_id bigint references public.folders(id) on delete set null;

create index if not exists places_folder_id_idx
  on public.places (folder_id);

alter table public.folders enable row level security;

drop policy if exists "folders_select_anon" on public.folders;
drop policy if exists "folders_insert_anon" on public.folders;
drop policy if exists "folders_update_anon" on public.folders;
drop policy if exists "folders_delete_anon" on public.folders;

create policy "folders_select_anon"
  on public.folders for select to anon, authenticated using (true);
create policy "folders_insert_anon"
  on public.folders for insert to anon, authenticated with check (true);
create policy "folders_update_anon"
  on public.folders for update to anon, authenticated using (true) with check (true);
create policy "folders_delete_anon"
  on public.folders for delete to anon, authenticated using (true);

grant select, insert, update, delete on table public.folders to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
