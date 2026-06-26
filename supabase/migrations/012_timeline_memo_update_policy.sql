-- 타임라인 메모 사진 URL 업데이트 권한
drop policy if exists "timeline_update_anon" on public.place_timeline_memos;
create policy "timeline_update_anon"
  on public.place_timeline_memos for update to anon, authenticated
  using (true) with check (true);
