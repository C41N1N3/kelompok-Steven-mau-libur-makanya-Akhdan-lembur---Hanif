# GLOSIO Functional MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the GLOSIO functional Greek learning MVP from the approved PRD with real Supabase accounts, responsive Figma-aligned UI, seeded lessons, practice modes, gamification, competitive difficulty, transcript-based AI conversation scoring, and performance-conscious data loading.

**Architecture:** Use a modular Next.js App Router architecture. Routes stay thin, feature folders own domain UI/logic, server queries/actions centralize Supabase access, and shared libraries isolate Supabase, AI, audio, errors, and gamification rules.

**Tech Stack:** pnpm, Next.js App Router, TypeScript, Tailwind CSS v4, shadcn/ui, Supabase Auth/Postgres/Storage/RLS, Vitest, Playwright, browser MediaRecorder/Web Speech APIs.

---

## Scope Check

The PRD covers multiple subsystems. Implement it as a phased MVP with independently testable milestones:

1. Scaffold and architecture foundation.
2. Supabase schema, seed data, and RLS.
3. Authentication and app shell.
4. Dashboard, lessons, and progress.
5. Practice modes and competitive difficulty.
6. Conversation transcript scoring.
7. Profile, leaderboard, performance, and QA.

Do not start with all screens at once. Each task should leave the app runnable.

## Target File Structure

```txt
D:\Code\IMK\
  src\
    app\
      (auth)\
      (dashboard)\
      api\
        conversation-score\
      globals.css
      layout.tsx
    components\
      feedback\
      layout\
      ui\
    data\
      seed\
    features\
      auth\
      conversation\
      difficulty\
      gamification\
      leaderboard\
      lessons\
      practice\
      profile\
      speech\
      writing\
    lib\
      ai\
      audio\
      errors\
      supabase\
      utils.ts
    server\
      actions\
      queries\
    types\
  supabase\
    migrations\
    seed.sql
  tests\
    unit\
    e2e\
```

## Task 1: Scaffold Next.js, Tailwind, shadcn/ui, and Test Tooling

**Files:**
- Create: `package.json`
- Create: `src/app/layout.tsx`
- Create: `src/app/globals.css`
- Create: `src/lib/utils.ts`
- Create: `vitest.config.ts`
- Create: `tests/unit/smoke.test.ts`

- [ ] **Step 1: Scaffold the app**

Run from `D:\Code\IMK`:

```powershell
pnpm create next-app@latest . --ts --eslint --app --src-dir --import-alias "@/*"
```

When prompted, choose Tailwind CSS and App Router. Expected: Next.js files are created under `src`.

- [ ] **Step 2: Initialize shadcn/ui**

Run:

```powershell
pnpm dlx shadcn@latest init
```

Choose:

```txt
Style: New York
Base color: Neutral
CSS variables: Yes
```

Expected: `components.json`, `src/components/ui`, and Tailwind-compatible CSS variables are configured.

- [ ] **Step 3: Install MVP dependencies**

Run:

```powershell
pnpm add @supabase/ssr @supabase/supabase-js zod lucide-react sonner clsx tailwind-merge class-variance-authority
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event playwright
```

Expected: dependencies install successfully.

- [ ] **Step 4: Add shadcn/ui components**

Run:

```powershell
pnpm dlx shadcn@latest add button card input label form avatar badge progress separator tabs dialog dropdown-menu skeleton sonner
```

Expected: UI primitive files appear in `src/components/ui`.

- [ ] **Step 5: Configure Vitest**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/unit/setup.ts"],
  },
  resolve: {
    alias: {
      "@": new URL("./src", import.meta.url).pathname,
    },
  },
});
```

Create `tests/unit/setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

Create `tests/unit/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test setup", () => {
  it("runs unit tests", () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 6: Add scripts**

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "e2e": "playwright test"
  }
}
```

- [ ] **Step 7: Verify scaffold**

Run:

```powershell
pnpm test
pnpm lint
pnpm typecheck
pnpm build
```

Expected: all commands pass.

- [ ] **Step 8: Commit**

```powershell
git add package.json pnpm-lock.yaml components.json next.config.* tsconfig.json eslint.config.* postcss.config.* src tests vitest.config.ts
git commit -m "chore: scaffold GLOSIO app"
```

## Task 2: Supabase Environment, Schema, Seed Data, and RLS

**Files:**
- Create: `.env.example`
- Create: `supabase/migrations/0001_initial_schema.sql`
- Create: `supabase/seed.sql`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/types/database.ts`

- [ ] **Step 1: Add environment template**

Create `.env.example`:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AI_PROVIDER=mock
OPENAI_API_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

- [ ] **Step 2: Create initial schema migration**

Create `supabase/migrations/0001_initial_schema.sql`:

```sql
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
  order_index integer not null
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
  completed_at timestamptz
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
  created_at timestamptz not null default now()
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
  created_at timestamptz not null default now()
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
create policy "recordings own" on public.recordings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "scores own" on public.conversation_scores for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "lessons read authenticated" on public.lessons for select to authenticated using (true);
create policy "items read authenticated" on public.lesson_items for select to authenticated using (true);
create policy "difficulties read authenticated" on public.lesson_item_difficulties for select to authenticated using (true);
create policy "badges read authenticated" on public.badges for select to authenticated using (true);
create policy "user badges own" on public.user_badges for select using (auth.uid() = user_id);
```

- [ ] **Step 3: Add seed data**

Create `supabase/seed.sql` with one beginner lesson covering all modes:

```sql
insert into public.lessons (slug, title, description, order_index, level)
values ('greek-basics-1', 'Greek Basics 1', 'Start with everyday Greek words and greetings.', 1, 'beginner')
on conflict (slug) do nothing;

with lesson as (
  select id from public.lessons where slug = 'greek-basics-1'
)
insert into public.lesson_items (lesson_id, kind, prompt, greek, options, answer, scenario_goals, order_index)
select id, 'vocabulary', 'Which word means "book"?', 'το βιβλίο',
  '["το τετράδιο","το βιβλίο","το μολύβι","το τραπέζι"]'::jsonb,
  'το βιβλίο', '[]'::jsonb, 1 from lesson
union all
select id, 'listening', 'Listen and choose the translation.', 'καλημέρα',
  '["Good morning","Thank you","How are you?","Please"]'::jsonb,
  'Good morning', '[]'::jsonb, 2 from lesson
union all
select id, 'speaking', 'Say "Good morning" in Greek.', 'καλημέρα',
  '[]'::jsonb, 'καλημέρα', '[]'::jsonb, 3 from lesson
union all
select id, 'conversation', 'Greet the waiter at a cafe.', null,
  '[]'::jsonb, null, '["greet politely","ask for water","say thank you"]'::jsonb, 4 from lesson
union all
select id, 'writing', 'Write the Greek letter alpha.', 'α',
  '[]'::jsonb, 'α', '[]'::jsonb, 5 from lesson;

insert into public.badges (slug, name, description, rule)
values
  ('first-lesson', 'First Lesson', 'Complete your first lesson.', 'complete_lessons >= 1'),
  ('streak-3', 'Three Day Streak', 'Practice three days in a row.', 'current_streak >= 3'),
  ('competitive-starter', 'Competitive Starter', 'Complete a competitive practice session.', 'competitive_sessions >= 1')
on conflict (slug) do nothing;
```

- [ ] **Step 4: Add Supabase clients**

Create `src/lib/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

Create `src/lib/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

- [ ] **Step 5: Verify SQL locally or against Supabase project**

Run the migration using the chosen Supabase workflow. If using Supabase CLI:

```powershell
supabase db reset
```

Expected: schema and seed data apply without SQL errors.

- [ ] **Step 6: Commit**

```powershell
git add .env.example supabase src/lib/supabase
git commit -m "feat: add Supabase schema and clients"
```

## Task 3: Auth Routes and Protected App Shell

**Files:**
- Create: `src/features/auth/actions.ts`
- Create: `src/features/auth/auth-form.tsx`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/(dashboard)/layout.tsx`
- Create: `src/components/layout/app-shell.tsx`
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/mobile-nav.tsx`

- [ ] **Step 1: Implement auth actions**

Create `src/features/auth/actions.ts`:

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return { error: error.message };
  redirect("/dashboard");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });
  if (error) return { error: error.message };
  if (data.url) redirect(data.url);
  return { error: "Google login did not return a redirect URL." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
```

- [ ] **Step 2: Add OAuth callback**

Create `src/app/auth/callback/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
```

- [ ] **Step 3: Add app shell**

Create `src/components/layout/app-shell.tsx`:

```tsx
import { ReactNode } from "react";
import { MobileNav } from "./mobile-nav";
import { Sidebar } from "./sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Sidebar />
      <main className="min-h-screen pb-20 md:ml-72 md:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
```

Create `src/components/layout/sidebar.tsx`:

```tsx
import Link from "next/link";
import { BookOpen, Home, Trophy, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-72 border-r bg-card p-6 md:block">
      <Link href="/dashboard" className="mb-10 block text-2xl font-bold tracking-normal">
        GLOSIO
      </Link>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href} className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-muted">
            <item.icon className="size-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

Create `src/components/layout/mobile-nav.tsx`:

```tsx
import Link from "next/link";
import { BookOpen, Home, Trophy, User } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/learn", label: "Learn", icon: BookOpen },
  { href: "/leaderboard", label: "Rank", icon: Trophy },
  { href: "/profile", label: "Profile", icon: User },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t bg-background md:hidden">
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className="flex h-16 flex-col items-center justify-center gap-1 text-xs">
          <item.icon className="size-5" />
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Protect dashboard layout**

Create `src/app/(dashboard)/layout.tsx`:

```tsx
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
```

- [ ] **Step 5: Verify**

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm build
```

Expected: protected pages build and unauthenticated access redirects.

- [ ] **Step 6: Commit**

```powershell
git add src/features/auth src/app src/components/layout
git commit -m "feat: add auth and protected app shell"
```

## Task 4: Gamification and Difficulty Domain Logic

**Files:**
- Create: `src/features/gamification/rules.ts`
- Create: `src/features/difficulty/rules.ts`
- Test: `tests/unit/gamification-rules.test.ts`
- Test: `tests/unit/difficulty-rules.test.ts`

- [ ] **Step 1: Write failing tests**

Create `tests/unit/gamification-rules.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateLevel, calculateXpReward, updateStreak } from "@/features/gamification/rules";

describe("gamification rules", () => {
  it("calculates level from xp", () => {
    expect(calculateLevel(0)).toBe(1);
    expect(calculateLevel(100)).toBe(2);
    expect(calculateLevel(450)).toBe(5);
  });

  it("applies difficulty multiplier to xp", () => {
    expect(calculateXpReward(20, 1)).toBe(20);
    expect(calculateXpReward(20, 1.5)).toBe(30);
  });

  it("continues streak for consecutive days", () => {
    expect(updateStreak("2026-05-25", "2026-05-26", 2)).toEqual({
      currentStreak: 3,
      longestStreak: 3,
    });
  });
});
```

Create `tests/unit/difficulty-rules.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyHealthPenalty, getDifficultyConfig } from "@/features/difficulty/rules";

describe("difficulty rules", () => {
  it("keeps conversation free from health and timers", () => {
    const config = getDifficultyConfig("conversation", "competitive");
    expect(config.usesHealth).toBe(false);
    expect(config.timeLimitSeconds).toBeNull();
    expect(config.xpMultiplier).toBeGreaterThan(1);
  });

  it("uses health and timers for competitive vocabulary", () => {
    const config = getDifficultyConfig("vocabulary", "competitive");
    expect(config.usesHealth).toBe(true);
    expect(config.startingHealth).toBe(3);
    expect(config.timeLimitSeconds).toBe(20);
  });

  it("does not reduce health below zero", () => {
    expect(applyHealthPenalty(1, -2)).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests and verify failure**

Run:

```powershell
pnpm test tests/unit/gamification-rules.test.ts tests/unit/difficulty-rules.test.ts
```

Expected: FAIL because modules do not exist.

- [ ] **Step 3: Implement rules**

Create `src/features/gamification/rules.ts`:

```ts
export function calculateLevel(xp: number) {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function calculateXpReward(baseXp: number, multiplier: number) {
  return Math.round(baseXp * multiplier);
}

export function updateStreak(lastPracticedOn: string | null, today: string, currentStreak: number) {
  if (!lastPracticedOn) return { currentStreak: 1, longestStreak: Math.max(1, currentStreak) };

  const last = new Date(`${lastPracticedOn}T00:00:00Z`);
  const current = new Date(`${today}T00:00:00Z`);
  const diffDays = Math.round((current.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 0) return { currentStreak, longestStreak: currentStreak };
  if (diffDays === 1) {
    const next = currentStreak + 1;
    return { currentStreak: next, longestStreak: next };
  }
  return { currentStreak: 1, longestStreak: Math.max(1, currentStreak) };
}
```

Create `src/features/difficulty/rules.ts`:

```ts
export type PracticeMode = "vocabulary" | "listening" | "speaking" | "conversation" | "writing";
export type Difficulty = "standard" | "competitive";

export type DifficultyConfig = {
  difficulty: Difficulty;
  usesHealth: boolean;
  startingHealth: number | null;
  timeLimitSeconds: number | null;
  xpMultiplier: number;
};

export function getDifficultyConfig(mode: PracticeMode, difficulty: Difficulty): DifficultyConfig {
  if (difficulty === "standard") {
    return { difficulty, usesHealth: false, startingHealth: null, timeLimitSeconds: null, xpMultiplier: 1 };
  }

  if (mode === "conversation") {
    return { difficulty, usesHealth: false, startingHealth: null, timeLimitSeconds: null, xpMultiplier: 1.5 };
  }

  const timeLimitSeconds = mode === "writing" ? 45 : mode === "speaking" ? 30 : 20;
  return { difficulty, usesHealth: true, startingHealth: 3, timeLimitSeconds, xpMultiplier: 1.5 };
}

export function applyHealthPenalty(currentHealth: number, delta: number) {
  return Math.max(0, currentHealth + delta);
}
```

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm test tests/unit/gamification-rules.test.ts tests/unit/difficulty-rules.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/gamification src/features/difficulty tests/unit
git commit -m "feat: add gamification and difficulty rules"
```

## Task 5: Lesson Queries, Dashboard, and Lesson List

**Files:**
- Create: `src/server/queries/lessons.ts`
- Create: `src/server/queries/profile.ts`
- Create: `src/app/(dashboard)/dashboard/page.tsx`
- Create: `src/app/(dashboard)/learn/page.tsx`
- Create: `src/features/lessons/lesson-card.tsx`
- Create: `src/components/feedback/empty-state.tsx`

- [ ] **Step 1: Add lesson query**

Create `src/server/queries/lessons.ts`:

```ts
import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export const getLessons = unstable_cache(
  async () => {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("lessons")
      .select("id, slug, title, description, level, order_index")
      .order("order_index", { ascending: true });
    if (error) throw new Error(error.message);
    return data ?? [];
  },
  ["lessons"],
  { revalidate: 3600 },
);
```

- [ ] **Step 2: Add dashboard and learn pages**

Create `src/app/(dashboard)/dashboard/page.tsx` that renders greeting, XP, streak, and first lesson card. Create `src/app/(dashboard)/learn/page.tsx` that renders paginated or limited lesson list from `getLessons()`.

- [ ] **Step 3: Verify**

Run:

```powershell
pnpm typecheck
pnpm build
```

Expected: pages compile and render with seeded lessons.

- [ ] **Step 4: Commit**

```powershell
git add src/server/queries src/app/\(dashboard\)/dashboard src/app/\(dashboard\)/learn src/features/lessons src/components/feedback
git commit -m "feat: add dashboard and lessons"
```

## Task 6: Practice Session Engine

**Files:**
- Create: `src/server/actions/practice.ts`
- Create: `src/server/queries/practice.ts`
- Create: `src/features/practice/session-shell.tsx`
- Create: `src/features/practice/progress-header.tsx`
- Test: `tests/unit/practice-session.test.ts`

- [ ] **Step 1: Write session state tests**

Create `tests/unit/practice-session.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { nextProgressValue } from "@/features/practice/progress";

describe("practice progress", () => {
  it("calculates progress percentage", () => {
    expect(nextProgressValue(2, 10)).toBe(20);
  });

  it("handles empty sessions", () => {
    expect(nextProgressValue(0, 0)).toBe(0);
  });
});
```

- [ ] **Step 2: Implement progress helper**

Create `src/features/practice/progress.ts`:

```ts
export function nextProgressValue(completed: number, total: number) {
  if (total <= 0) return 0;
  return Math.min(100, Math.round((completed / total) * 100));
}
```

- [ ] **Step 3: Add server actions**

Create `src/server/actions/practice.ts`:

```ts
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getDifficultyConfig, type Difficulty, type PracticeMode } from "@/features/difficulty/rules";
import { calculateLevel, calculateXpReward } from "@/features/gamification/rules";

export async function startPracticeSession(input: {
  lessonId: string;
  mode: PracticeMode;
  difficulty: Difficulty;
}) {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) return { error: "You must be signed in to start practice." };

  const config = getDifficultyConfig(input.mode, input.difficulty);
  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userResult.user.id,
      lesson_id: input.lessonId,
      mode: input.mode,
      difficulty: input.difficulty,
      starting_health: config.startingHealth,
      ending_health: config.startingHealth,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  return { sessionId: data.id };
}

export async function completePracticeSession(input: {
  sessionId: string;
  baseXp: number;
  multiplier: number;
}) {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) return { error: "You must be signed in to complete practice." };

  const earnedXp = calculateXpReward(input.baseXp, input.multiplier);
  const { data: profile } = await supabase
    .from("profiles")
    .select("xp")
    .eq("id", userResult.user.id)
    .single();

  const nextXp = (profile?.xp ?? 0) + earnedXp;
  const nextLevel = calculateLevel(nextXp);

  const { error: sessionError } = await supabase
    .from("practice_sessions")
    .update({ status: "completed", earned_xp: earnedXp, completed_at: new Date().toISOString() })
    .eq("id", input.sessionId)
    .eq("user_id", userResult.user.id);

  if (sessionError) return { error: sessionError.message };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ xp: nextXp, level: nextLevel, updated_at: new Date().toISOString() })
    .eq("id", userResult.user.id);

  if (profileError) return { error: profileError.message };
  revalidatePath("/dashboard");
  return { earnedXp, nextLevel };
}
```

Create `src/server/queries/practice.ts`:

```ts
import { createClient } from "@/lib/supabase/server";

export async function getLessonItemsForMode(lessonId: string, mode: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_items")
    .select("id, kind, prompt, greek, options, answer, scenario_goals, order_index")
    .eq("lesson_id", lessonId)
    .eq("kind", mode)
    .order("order_index", { ascending: true });
  if (error) throw new Error(error.message);
  return data ?? [];
}
```

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm test tests/unit/practice-session.test.ts
pnpm typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/server/actions/practice.ts src/server/queries/practice.ts src/features/practice tests/unit/practice-session.test.ts
git commit -m "feat: add practice session engine"
```

## Task 7: Vocabulary, Listening, and Speaking Practice

**Files:**
- Create: `src/app/(dashboard)/practice/[mode]/page.tsx`
- Create: `src/features/practice/vocabulary-practice.tsx`
- Create: `src/features/practice/listening-practice.tsx`
- Create: `src/features/speech/speaking-practice.tsx`
- Create: `src/lib/audio/tts.ts`
- Create: `src/lib/audio/recorder.ts`

- [ ] **Step 1: Add browser audio utilities**

Create `src/lib/audio/tts.ts`:

```ts
export function speakGreek(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return { ok: false, error: "Text-to-speech is not supported in this browser." };
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "el-GR";
  window.speechSynthesis.speak(utterance);
  return { ok: true };
}
```

Create `src/lib/audio/recorder.ts`:

```ts
export async function createAudioRecorder() {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
    throw new Error("Recording is not supported in this browser.");
  }
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const chunks: BlobPart[] = [];
  const recorder = new MediaRecorder(stream);
  recorder.ondataavailable = (event) => chunks.push(event.data);
  return {
    recorder,
    stop: () =>
      new Promise<Blob>((resolve) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType }));
        recorder.stop();
        stream.getTracks().forEach((track) => track.stop());
      }),
  };
}
```

- [ ] **Step 2: Build practice UIs**

Create `src/features/practice/progress-header.tsx`:

```tsx
import { Heart, Timer, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import type { DifficultyConfig } from "@/features/difficulty/rules";

export function ProgressHeader({
  progress,
  config,
  health,
}: {
  progress: number;
  config: DifficultyConfig;
  health: number | null;
}) {
  return (
    <div className="space-y-3">
      <Progress value={progress} />
      {config.difficulty === "competitive" ? (
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {config.timeLimitSeconds ? <span className="inline-flex items-center gap-1"><Timer className="size-4" /> {config.timeLimitSeconds}s</span> : null}
          {config.usesHealth ? <span className="inline-flex items-center gap-1"><Heart className="size-4" /> {health}</span> : null}
          <span className="inline-flex items-center gap-1"><Zap className="size-4" /> {config.xpMultiplier}x XP</span>
        </div>
      ) : null}
    </div>
  );
}
```

Create `src/features/practice/vocabulary-practice.tsx` as a client component that renders the current prompt, options as buttons, `ProgressHeader`, local correct/incorrect state, and calls the completion action when all prompts are answered.

Create `src/features/practice/listening-practice.tsx` as a client component that adds a "Play" button calling `speakGreek(item.greek ?? item.prompt)` before rendering the same multiple-choice pattern.

Create `src/features/speech/speaking-practice.tsx` as a client component that calls `createAudioRecorder()`, stores a local blob URL for playback, and allows retry if microphone permission fails.

- [ ] **Step 3: Verify**

Run:

```powershell
pnpm typecheck
pnpm build
```

Expected: practice routes compile and browser-only audio code is loaded only in client components.

- [ ] **Step 4: Commit**

```powershell
git add src/app/\(dashboard\)/practice src/features/practice src/features/speech src/lib/audio
git commit -m "feat: add core practice modes"
```

## Task 8: Writing Canvas Practice

**Files:**
- Create: `src/features/writing/drawing-canvas.tsx`
- Create: `src/features/writing/writing-practice.tsx`
- Test: `tests/unit/writing-history.test.ts`

- [ ] **Step 1: Write undo history test**

Create `tests/unit/writing-history.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { pushStroke, undoStroke } from "@/features/writing/history";

describe("writing history", () => {
  it("pushes and undoes strokes", () => {
    const state = pushStroke([], [{ x: 1, y: 1 }]);
    expect(state).toHaveLength(1);
    expect(undoStroke(state)).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Implement history helper**

Create `src/features/writing/history.ts`:

```ts
export type Point = { x: number; y: number };
export type Stroke = Point[];

export function pushStroke(strokes: Stroke[], stroke: Stroke) {
  return [...strokes, stroke];
}

export function undoStroke(strokes: Stroke[]) {
  return strokes.slice(0, -1);
}
```

- [ ] **Step 3: Build canvas component**

Create `src/features/writing/drawing-canvas.tsx` as a client component using pointer events. It must support mouse, touch, stylus, undo, clear, and stable dimensions.

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm test tests/unit/writing-history.test.ts
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/features/writing tests/unit/writing-history.test.ts
git commit -m "feat: add writing canvas practice"
```

## Task 9: Conversation Practice and Transcript-Based AI Scoring

**Files:**
- Create: `src/lib/ai/conversation-scorer.ts`
- Create: `src/lib/ai/providers/mock.ts`
- Create: `src/app/api/conversation-score/route.ts`
- Create: `src/features/conversation/conversation-practice.tsx`
- Create: `src/features/conversation/conversation-result.tsx`
- Test: `tests/unit/conversation-scorer.test.ts`

- [ ] **Step 1: Write scorer contract test**

Create `tests/unit/conversation-scorer.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { scoreConversationWithMock } from "@/lib/ai/providers/mock";

describe("mock conversation scorer", () => {
  it("returns bounded scores and feedback", async () => {
    const result = await scoreConversationWithMock({
      sessionId: "session-1",
      difficulty: "competitive",
      scenario: "Greet the waiter at a cafe.",
      scenarioGoals: ["greet politely", "ask for water", "say thank you"],
      transcript: "Hello. Water please. Thank you.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.improvementTips.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Implement AI interface and mock provider**

Create `src/lib/ai/conversation-scorer.ts`:

```ts
import type { Difficulty } from "@/features/difficulty/rules";

export type ScoreConversationInput = {
  sessionId: string;
  difficulty: Difficulty;
  scenario: string;
  scenarioGoals: string[];
  transcript: string;
};

export type ConversationScore = {
  overallScore: number;
  relevanceScore: number;
  completenessScore: number;
  fluencyScore: number;
  confidenceScore: number;
  speakingQualityScore: number;
  strengths: string[];
  improvementTips: string[];
};
```

Create `src/lib/ai/providers/mock.ts`:

```ts
import type { ConversationScore, ScoreConversationInput } from "../conversation-scorer";

export async function scoreConversationWithMock(input: ScoreConversationInput): Promise<ConversationScore> {
  const wordCount = input.transcript.trim().split(/\s+/).filter(Boolean).length;
  const goalBonus = input.scenarioGoals.length * 5;
  const difficultyBonus = input.difficulty === "competitive" ? 5 : 0;
  const base = Math.min(100, 50 + wordCount * 3 + goalBonus + difficultyBonus);

  return {
    overallScore: base,
    relevanceScore: base,
    completenessScore: Math.min(100, base + 2),
    fluencyScore: Math.max(0, base - 5),
    confidenceScore: Math.max(0, base - 3),
    speakingQualityScore: 70,
    strengths: ["You completed the scenario and kept the conversation relevant."],
    improvementTips: ["Try adding one more complete Greek sentence next time."],
  };
}
```

- [ ] **Step 3: Add API route**

Create `src/app/api/conversation-score/route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { scoreConversationWithMock } from "@/lib/ai/providers/mock";

export async function POST(request: Request) {
  const body = (await request.json()) as { sessionId?: string };
  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();
  if (!userResult.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, user_id, difficulty, lesson_id")
    .eq("id", body.sessionId)
    .eq("user_id", userResult.user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json({ error: "Conversation session not found" }, { status: 404 });
  }

  const { data: answers, error: answersError } = await supabase
    .from("practice_answers")
    .select("answer_text")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (answersError) {
    return NextResponse.json({ error: answersError.message }, { status: 500 });
  }

  const transcript = (answers ?? []).map((answer) => answer.answer_text).filter(Boolean).join("\n");
  const score = await scoreConversationWithMock({
    sessionId: session.id,
    difficulty: session.difficulty,
    scenario: "Conversation practice",
    scenarioGoals: [],
    transcript,
  });

  const { error: insertError } = await supabase.from("conversation_scores").upsert({
    session_id: session.id,
    user_id: userResult.user.id,
    provider: process.env.AI_PROVIDER ?? "mock",
    overall_score: score.overallScore,
    relevance_score: score.relevanceScore,
    completeness_score: score.completenessScore,
    fluency_score: score.fluencyScore,
    confidence_score: score.confidenceScore,
    speaking_quality_score: score.speakingQualityScore,
    strengths: score.strengths,
    improvement_tips: score.improvementTips,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  return NextResponse.json(score);
}
```

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm test tests/unit/conversation-scorer.test.ts
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/lib/ai src/app/api/conversation-score src/features/conversation tests/unit/conversation-scorer.test.ts
git commit -m "feat: add conversation scoring"
```

## Task 10: Profile, Leaderboard, Pagination, and Performance Pass

**Files:**
- Create: `src/server/queries/leaderboard.ts`
- Create: `src/app/(dashboard)/leaderboard/page.tsx`
- Create: `src/app/(dashboard)/profile/page.tsx`
- Create: `src/features/leaderboard/leaderboard-table.tsx`
- Create: `src/features/profile/profile-summary.tsx`

- [ ] **Step 1: Add paginated leaderboard query**

Create `src/server/queries/leaderboard.ts`:

```ts
import { createClient } from "@/lib/supabase/server";

export async function getLeaderboardPage(page = 1, pageSize = 20) {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const supabase = await createClient();
  const { data, error, count } = await supabase
    .from("leaderboard")
    .select("*", { count: "exact" })
    .range(from, to);
  if (error) throw new Error(error.message);
  return { rows: data ?? [], count: count ?? 0, page, pageSize };
}
```

- [ ] **Step 2: Build pages**

Create `src/app/(dashboard)/leaderboard/page.tsx`:

```tsx
import { getLeaderboardPage } from "@/server/queries/leaderboard";
import { LeaderboardTable } from "@/features/leaderboard/leaderboard-table";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Number(params.page ?? "1");
  const leaderboard = await getLeaderboardPage(Number.isFinite(page) ? page : 1);
  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-3xl font-semibold tracking-normal">Leaderboard</h1>
      <LeaderboardTable {...leaderboard} />
    </section>
  );
}
```

Create `src/features/leaderboard/leaderboard-table.tsx`:

```tsx
export function LeaderboardTable({
  rows,
}: {
  rows: Array<{ id: string; display_name: string; xp: number; level: number; current_streak: number }>;
}) {
  if (rows.length === 0) return <p className="mt-6 text-sm text-muted-foreground">No rankings yet.</p>;
  return (
    <div className="mt-6 overflow-hidden rounded-md border">
      {rows.map((row, index) => (
        <div key={row.id} className="grid grid-cols-[3rem_1fr_5rem_5rem] gap-3 border-b p-3 text-sm last:border-b-0">
          <span>{index + 1}</span>
          <span>{row.display_name}</span>
          <span>{row.xp} XP</span>
          <span>Lv {row.level}</span>
        </div>
      ))}
    </div>
  );
}
```

Create `src/app/(dashboard)/profile/page.tsx`:

```tsx
import { ProfileSummary } from "@/features/profile/profile-summary";

export default function ProfilePage() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="text-3xl font-semibold tracking-normal">Profile</h1>
      <ProfileSummary />
    </section>
  );
}
```

Create `src/features/profile/profile-summary.tsx`:

```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ProfileSummary() {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Learning Stats</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-3">
        <div>XP</div>
        <div>Level</div>
        <div>Streak</div>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Add route-level error and loading files**

For dashboard route groups, create `loading.tsx` and `error.tsx` files that render shadcn skeletons and retry UI.

- [ ] **Step 4: Verify**

Run:

```powershell
pnpm typecheck
pnpm build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add src/server/queries/leaderboard.ts src/app/\(dashboard\)/leaderboard src/app/\(dashboard\)/profile src/features/leaderboard src/features/profile
git commit -m "feat: add profile and leaderboard"
```

## Task 11: Responsive Figma Polish and Accessibility

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/components/layout/app-shell.tsx`
- Modify: `src/components/layout/sidebar.tsx`
- Modify: `src/components/layout/mobile-nav.tsx`
- Modify: `src/features/practice/vocabulary-practice.tsx`
- Modify: `src/features/practice/listening-practice.tsx`
- Modify: `src/features/speech/speaking-practice.tsx`
- Modify: `src/features/writing/writing-practice.tsx`
- Modify: `src/features/conversation/conversation-practice.tsx`
- Create: `tests/e2e/smoke.spec.ts`

- [ ] **Step 1: Add Playwright smoke test**

Create `tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from "@playwright/test";

test("home route redirects or renders without crashing", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/GLOSIO|Create Next App/);
});
```

- [ ] **Step 2: Run local browser verification**

Run:

```powershell
pnpm dev
```

Open `http://localhost:3000` and verify:

- Desktop sidebar is visible at desktop width.
- Mobile bottom nav is visible at mobile width.
- Text does not overlap.
- Practice controls fit in their containers.
- Writing canvas has stable size.

- [ ] **Step 3: Run checks**

Run:

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: PASS.

- [ ] **Step 4: Commit**

```powershell
git add src tests/e2e
git commit -m "style: polish responsive GLOSIO UI"
```

## Final Verification

- [ ] **Step 1: Run full verification**

```powershell
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Expected: all pass.

- [ ] **Step 2: Run manual MVP flow**

Verify:

- User can register or sign in.
- Dashboard loads.
- Lesson list loads.
- Vocabulary, listening, speaking, conversation, and writing modes render.
- Competitive mode shows timers, health, and XP multiplier outside conversation.
- Conversation competitive mode uses harder prompt rules without timer or health.
- Transcript-based conversation score returns using mock provider.
- Leaderboard and profile load with limited/paginated queries.

- [ ] **Step 3: Commit final fixes**

```powershell
git add .
git commit -m "fix: complete GLOSIO MVP verification"
```
