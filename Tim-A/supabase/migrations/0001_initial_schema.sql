create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Learner',
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  level integer not null default 1 check (level >= 1),
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_practiced_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text not null,
  order_index integer not null,
  level text not null check (level in ('beginner', 'intermediate', 'advanced')),
  created_at timestamptz not null default now()
);

create table public.lesson_items (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  kind text not null check (kind in ('vocabulary', 'listening', 'speaking', 'conversation', 'writing')),
  prompt text not null,
  greek text,
  options jsonb not null default '[]'::jsonb,
  answer text,
  scenario_goals jsonb not null default '[]'::jsonb,
  order_index integer not null,
  unique (lesson_id, kind, order_index)
);

create table public.lesson_item_difficulties (
  id uuid primary key default gen_random_uuid(),
  lesson_item_id uuid not null references public.lesson_items(id) on delete cascade,
  difficulty text not null check (difficulty in ('standard', 'competitive')),
  prompt_override text,
  time_limit_seconds integer,
  starting_health integer not null default 3,
  xp_multiplier numeric(4,2) not null default 1.00,
  metadata jsonb not null default '{}'::jsonb,
  unique (lesson_item_id, difficulty)
);

create table public.practice_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_id uuid references public.lessons(id) on delete set null,
  mode text not null check (mode in ('vocabulary', 'listening', 'speaking', 'conversation', 'writing')),
  difficulty text not null check (difficulty in ('standard', 'competitive')),
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'failed')),
  starting_health integer,
  ending_health integer,
  earned_xp integer not null default 0,
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (id, user_id)
);

create table public.practice_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  lesson_item_id uuid references public.lesson_items(id) on delete set null,
  answer_text text,
  is_correct boolean,
  time_spent_seconds integer,
  health_delta integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.recordings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  session_id uuid not null references public.practice_sessions(id) on delete cascade,
  storage_path text not null,
  duration_seconds integer,
  mime_type text not null,
  created_at timestamptz not null default now(),
  check (storage_path like user_id::text || '/%'),
  foreign key (session_id, user_id) references public.practice_sessions(id, user_id) on delete cascade
);

create table public.conversation_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references public.practice_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  overall_score integer not null check (overall_score between 0 and 100),
  relevance_score integer not null check (relevance_score between 0 and 100),
  completeness_score integer not null check (completeness_score between 0 and 100),
  fluency_score integer not null check (fluency_score between 0 and 100),
  confidence_score integer not null check (confidence_score between 0 and 100),
  speaking_quality_score integer not null check (speaking_quality_score between 0 and 100),
  strengths jsonb not null default '[]'::jsonb,
  improvement_tips jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (session_id, user_id) references public.practice_sessions(id, user_id) on delete cascade
);

create table public.badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text not null,
  rule text not null
);

create table public.user_badges (
  user_id uuid not null references auth.users(id) on delete cascade,
  badge_id uuid not null references public.badges(id) on delete cascade,
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_id)
);

create or replace view public.leaderboard as
select id, display_name, avatar_url, xp, level, current_streak
from public.profiles
order by xp desc, current_streak desc, display_name asc;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'full_name', 'Learner'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.practice_answers enable row level security;
alter table public.recordings enable row level security;
alter table public.conversation_scores enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_items enable row level security;
alter table public.lesson_item_difficulties enable row level security;
alter table public.badges enable row level security;
alter table public.user_badges enable row level security;

create policy "profiles read own" on public.profiles for select using (auth.uid() = id);
create policy "profiles update own" on public.profiles for update using (auth.uid() = id);
create policy "sessions own" on public.practice_sessions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "answers through own session" on public.practice_answers for all using (
  exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "recordings own" on public.recordings for all using (
  exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "scores own" on public.conversation_scores for all using (
  exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
) with check (
  exists (select 1 from public.practice_sessions s where s.id = session_id and s.user_id = auth.uid())
);
create policy "lessons read authenticated" on public.lessons for select to authenticated using (true);
create policy "items read authenticated" on public.lesson_items for select to authenticated using (true);
create policy "difficulties read authenticated" on public.lesson_item_difficulties for select to authenticated using (true);
create policy "badges read authenticated" on public.badges for select to authenticated using (true);
create policy "user badges own" on public.user_badges for select using (auth.uid() = user_id);

revoke update on public.profiles from public;
revoke update on public.profiles from anon;
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url) on public.profiles to authenticated;

revoke all on public.leaderboard from public;
revoke all on public.leaderboard from anon;
revoke all on public.leaderboard from authenticated;
grant select on public.leaderboard to authenticated;
