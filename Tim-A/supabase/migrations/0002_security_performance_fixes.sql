create or replace view public.leaderboard
with (security_invoker = true)
as
select id, display_name, avatar_url, xp, level, current_streak
from public.profiles
order by xp desc, current_streak desc, display_name asc;

revoke all on public.leaderboard from public;
revoke all on public.leaderboard from anon;
revoke all on public.leaderboard from authenticated;
grant select on public.leaderboard to authenticated;

revoke execute on function public.handle_new_user() from public;
revoke execute on function public.handle_new_user() from anon;
revoke execute on function public.handle_new_user() from authenticated;

do $$
begin
  if exists (
    select 1
    from pg_proc
    join pg_namespace on pg_namespace.oid = pg_proc.pronamespace
    where pg_namespace.nspname = 'public'
      and pg_proc.proname = 'rls_auto_enable'
      and pg_proc.pronargs = 0
  ) then
    revoke execute on function public.rls_auto_enable() from public;
    revoke execute on function public.rls_auto_enable() from anon;
    revoke execute on function public.rls_auto_enable() from authenticated;
  end if;
end $$;

drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles update own" on public.profiles;
drop policy if exists "sessions own" on public.practice_sessions;
drop policy if exists "answers through own session" on public.practice_answers;
drop policy if exists "recordings own" on public.recordings;
drop policy if exists "scores own" on public.conversation_scores;
drop policy if exists "user badges own" on public.user_badges;

create policy "profiles read own" on public.profiles
  for select using ((select auth.uid()) = id);

create policy "profiles update own" on public.profiles
  for update using ((select auth.uid()) = id);

create policy "sessions own" on public.practice_sessions
  for all using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "answers through own session" on public.practice_answers
  for all using (
    exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "recordings own" on public.recordings
  for all using (
    exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "scores own" on public.conversation_scores
  for all using (
    exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.practice_sessions s
      where s.id = session_id
        and s.user_id = (select auth.uid())
    )
  );

create policy "user badges own" on public.user_badges
  for select using ((select auth.uid()) = user_id);

grant update (
  display_name,
  avatar_url,
  xp,
  level,
  current_streak,
  longest_streak,
  last_practiced_on,
  updated_at
) on public.profiles to authenticated;

create index if not exists idx_practice_sessions_user_id
  on public.practice_sessions(user_id);
create index if not exists idx_practice_sessions_lesson_id
  on public.practice_sessions(lesson_id);
create index if not exists idx_practice_answers_session_id
  on public.practice_answers(session_id);
create index if not exists idx_practice_answers_lesson_item_id
  on public.practice_answers(lesson_item_id);
create index if not exists idx_recordings_user_id
  on public.recordings(user_id);
create index if not exists idx_recordings_session_id
  on public.recordings(session_id);
create index if not exists idx_recordings_session_user_id
  on public.recordings(session_id, user_id);
create index if not exists idx_conversation_scores_user_id
  on public.conversation_scores(user_id);
create index if not exists idx_conversation_scores_session_user_id
  on public.conversation_scores(session_id, user_id);
create index if not exists idx_user_badges_badge_id
  on public.user_badges(badge_id);
