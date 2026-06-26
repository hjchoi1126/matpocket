-- vote_ballots upsert는 INSERT + UPDATE 권한이 모두 필요합니다.

drop policy if exists "vote_ballots_update_anon" on public.vote_ballots;
drop policy if exists "vote_ballots_delete_anon" on public.vote_ballots;

create policy "vote_ballots_update_anon"
  on public.vote_ballots for update to anon, authenticated
  using (true) with check (true);

create policy "vote_ballots_delete_anon"
  on public.vote_ballots for delete to anon, authenticated
  using (true);

grant update, delete on table public.vote_ballots to anon, authenticated;
