-- 공동 편집 폴더
alter table public.folders
  add column if not exists is_shared boolean not null default false;

alter table public.folders
  add column if not exists invite_token uuid unique default gen_random_uuid();

create index if not exists folders_invite_token_idx
  on public.folders (invite_token)
  where is_shared = true;

create table if not exists public.folder_members (
  id bigserial primary key,
  folder_id bigint not null references public.folders(id) on delete cascade,
  user_id uuid not null,
  display_name text not null default '맛집러',
  role text not null default 'editor' check (role in ('owner', 'editor')),
  joined_at timestamptz not null default now(),
  unique (folder_id, user_id)
);

create index if not exists folder_members_user_id_idx
  on public.folder_members (user_id);

create index if not exists folder_members_folder_id_idx
  on public.folder_members (folder_id);

alter table public.folder_members enable row level security;

drop policy if exists "folder_members_select_anon" on public.folder_members;
drop policy if exists "folder_members_insert_anon" on public.folder_members;
drop policy if exists "folder_members_update_anon" on public.folder_members;
drop policy if exists "folder_members_delete_anon" on public.folder_members;

create policy "folder_members_select_anon"
  on public.folder_members for select to anon, authenticated using (true);
create policy "folder_members_insert_anon"
  on public.folder_members for insert to anon, authenticated with check (true);
create policy "folder_members_update_anon"
  on public.folder_members for update to anon, authenticated using (true) with check (true);
create policy "folder_members_delete_anon"
  on public.folder_members for delete to anon, authenticated using (true);

grant select, insert, update, delete on table public.folder_members to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;
