-- 타임라인 메모 음식 사진
alter table public.place_timeline_memos
  add column if not exists image_urls text[] not null default '{}';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'timeline-photos',
  'timeline-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
)
on conflict (id) do update set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[];

drop policy if exists "timeline_photos_select" on storage.objects;
drop policy if exists "timeline_photos_insert" on storage.objects;
drop policy if exists "timeline_photos_delete" on storage.objects;

create policy "timeline_photos_select"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'timeline-photos');

create policy "timeline_photos_insert"
  on storage.objects for insert to anon, authenticated
  with check (bucket_id = 'timeline-photos');

create policy "timeline_photos_delete"
  on storage.objects for delete to anon, authenticated
  using (bucket_id = 'timeline-photos');

drop policy if exists "timeline_update_anon" on public.place_timeline_memos;
create policy "timeline_update_anon"
  on public.place_timeline_memos for update to anon, authenticated
  using (true) with check (true);
