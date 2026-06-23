insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'recordings',
  'recordings',
  false,
  10485760,
  array['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "recordings storage read own" on storage.objects;
drop policy if exists "recordings storage insert own" on storage.objects;
drop policy if exists "recordings storage update own" on storage.objects;
drop policy if exists "recordings storage delete own" on storage.objects;

create policy "recordings storage read own" on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "recordings storage insert own" on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "recordings storage update own" on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create policy "recordings storage delete own" on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'recordings'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create table if not exists public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  primary_language text not null default 'English',
  time_zone text not null default '(GMT+02:00)',
  date_format text not null default 'DD/MM/YYYY',
  font_size integer not null default 12 check (font_size between 10 and 24),
  updated_at timestamptz not null default now()
);

alter table public.user_preferences enable row level security;

drop policy if exists "preferences own" on public.user_preferences;

create policy "preferences own" on public.user_preferences
  for all
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.user_preferences to authenticated;
