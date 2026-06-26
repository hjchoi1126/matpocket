-- 타임라인 사진 버킷 MIME/용량 설정 보정
update storage.buckets
set
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/heic',
    'image/heif'
  ]::text[]
where id = 'timeline-photos';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select
  'timeline-photos',
  'timeline-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']::text[]
where not exists (
  select 1 from storage.buckets where id = 'timeline-photos'
);

alter table public.place_timeline_memos
  add column if not exists image_urls text[] not null default '{}';

drop policy if exists "timeline_update_anon" on public.place_timeline_memos;
create policy "timeline_update_anon"
  on public.place_timeline_memos for update to anon, authenticated
  using (true) with check (true);

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
