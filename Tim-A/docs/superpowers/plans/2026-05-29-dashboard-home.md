# Dashboard (Home) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the Dashboard (Home) screen — header with greeting/streak, weekly streak card, level/XP progress card, and Lesson of the Day card — all populated with real Supabase data.

**Architecture:** React Server Component page fetches profile, practice history, and lesson in parallel via `Promise.all`, then passes typed props to four presentational child components. Pure helper functions derive display values (tier title, XP math, weekly day dots) and are unit-tested in isolation.

**Tech Stack:** Next.js 16 App Router, React 19 Server Components, Supabase SSR client, shadcn/ui, Tailwind CSS v4, Vitest + @testing-library/react, Cinzel (Google Font)

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/features/dashboard/helpers.ts` | Pure functions: tier, XP math, week days |
| Create | `src/features/dashboard/queries.ts` | Supabase data fetching |
| Create | `src/features/dashboard/dashboard-header.tsx` | Avatar, greeting, streak badge |
| Create | `src/features/dashboard/streak-card.tsx` | Weekly dots, owl, quote |
| Create | `src/features/dashboard/level-progress-card.tsx` | Level, tier, XP bar |
| Create | `src/features/dashboard/lesson-of-the-day-card.tsx` | Hero, title, description, CTA |
| Create | `tests/unit/dashboard-helpers.test.ts` | Unit tests for helpers.ts |
| Modify | `src/app/(dashboard)/dashboard/page.tsx` | Wire up server component |
| Modify | `src/app/layout.tsx` | Add Cinzel font |

---

## Task 1: Pure helper functions

**Files:**
- Create: `src/features/dashboard/helpers.ts`
- Create: `tests/unit/dashboard-helpers.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `tests/unit/dashboard-helpers.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import {
  getLevelTier,
  getXpProgress,
  getWeekDays,
} from "@/features/dashboard/helpers";

describe("getLevelTier", () => {
  it("returns Beginner for levels 1-5", () => {
    expect(getLevelTier(1)).toBe("Beginner");
    expect(getLevelTier(5)).toBe("Beginner");
  });

  it("returns Explorer for levels 6-10", () => {
    expect(getLevelTier(6)).toBe("Explorer");
    expect(getLevelTier(10)).toBe("Explorer");
  });

  it("returns Greek Explorer for levels 11-20", () => {
    expect(getLevelTier(11)).toBe("Greek Explorer");
    expect(getLevelTier(20)).toBe("Greek Explorer");
  });

  it("returns Master for level 21+", () => {
    expect(getLevelTier(21)).toBe("Master");
    expect(getLevelTier(100)).toBe("Master");
  });
});

describe("getXpProgress", () => {
  it("calculates progress within current level", () => {
    const result = getXpProgress(650);
    expect(result).toEqual({ current: 650, total: 1000, toNext: 350 });
  });

  it("handles xp = 0", () => {
    expect(getXpProgress(0)).toEqual({ current: 0, total: 1000, toNext: 1000 });
  });

  it("handles exact level boundary", () => {
    expect(getXpProgress(1000)).toEqual({ current: 0, total: 1000, toNext: 1000 });
  });

  it("handles multi-level xp", () => {
    expect(getXpProgress(2400)).toEqual({ current: 400, total: 1000, toNext: 600 });
  });
});

describe("getWeekDays", () => {
  it("returns 7 entries with correct labels", () => {
    const today = new Date("2026-05-29"); // Friday
    const result = getWeekDays([], today);
    expect(result).toHaveLength(7);
    expect(result.map((d) => d.label)).toEqual(["S", "S", "M", "T", "W", "T", "F"]);
  });

  it("marks days with practice sessions", () => {
    const today = new Date("2026-05-29");
    const practiced = [new Date("2026-05-27"), new Date("2026-05-29")];
    const result = getWeekDays(practiced, today);
    const fridayEntry = result.find((d) => d.label === "F");
    const wednesdayEntry = result[result.findIndex((d, i) => d.label === "W" && i > 2)];
    expect(fridayEntry?.practiced).toBe(true);
    expect(wednesdayEntry?.practiced).toBe(true);
    expect(result[0].practiced).toBe(false);
  });

  it("marks all days as not practiced when history is empty", () => {
    const today = new Date("2026-05-29");
    const result = getWeekDays([], today);
    expect(result.every((d) => !d.practiced)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```bash
cd IMK && pnpm test tests/unit/dashboard-helpers.test.ts
```

Expected: FAIL with "Cannot find module '@/features/dashboard/helpers'"

- [ ] **Step 3: Create helpers.ts**

Create `src/features/dashboard/helpers.ts`:

```typescript
export function getLevelTier(level: number): string {
  if (level <= 5) return "Beginner";
  if (level <= 10) return "Explorer";
  if (level <= 20) return "Greek Explorer";
  return "Master";
}

export function getXpProgress(xp: number): {
  current: number;
  total: number;
  toNext: number;
} {
  const current = xp % 1000;
  const total = 1000;
  return { current, total, toNext: total - current };
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function getWeekDays(
  practicedDates: Date[],
  today: Date = new Date(),
): Array<{ label: string; practiced: boolean }> {
  const practicedSet = new Set(
    practicedDates.map((d) => toDateString(d)),
  );

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    return {
      label: DAY_LABELS[date.getDay()],
      practiced: practicedSet.has(toDateString(date)),
    };
  });
}

function toDateString(date: Date): string {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```bash
cd IMK && pnpm test tests/unit/dashboard-helpers.test.ts
```

Expected: all 9 tests PASS

- [ ] **Step 5: Commit**

```bash
git add IMK/src/features/dashboard/helpers.ts IMK/tests/unit/dashboard-helpers.test.ts
git commit -m "feat: add dashboard helper functions with tests"
```

---

## Task 2: Dashboard query functions

**Files:**
- Create: `src/features/dashboard/queries.ts`

No unit tests — these functions are thin wrappers around Supabase. Integration tested manually.

- [ ] **Step 1: Create queries.ts**

Create `src/features/dashboard/queries.ts`:

```typescript
import { createClient } from "@/lib/supabase/server";

export type DashboardProfile = {
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
};

export type DashboardLesson = {
  slug: string;
  title: string;
  description: string;
};

export async function getProfile(
  userId: string,
): Promise<DashboardProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, xp, level, current_streak")
    .eq("id", userId)
    .single();
  return data;
}

export async function getPracticeHistory(userId: string): Promise<Date[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data } = await supabase
    .from("practice_sessions")
    .select("started_at")
    .eq("user_id", userId)
    .gte("started_at", sevenDaysAgo.toISOString())
    .eq("status", "completed");

  return (data ?? []).map((row) => new Date(row.started_at));
}

export async function getLessonOfTheDay(): Promise<DashboardLesson | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("slug, title, description")
    .order("order_index", { ascending: true })
    .limit(1)
    .single();
  return data;
}
```

- [ ] **Step 2: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add IMK/src/features/dashboard/queries.ts
git commit -m "feat: add dashboard query functions"
```

---

## Task 3: Add Cinzel font

**Files:**
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Update layout.tsx to add Cinzel**

Open `src/app/layout.tsx`. Replace the entire file with:

```typescript
import type { Metadata } from "next";
import { Cinzel, Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "GLOSIO",
  description: "Learn Greek with focused daily practice.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${cinzel.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Add font utility class in globals.css**

Open `src/app/globals.css`. Add at the bottom of the file:

```css
.font-cinzel {
  font-family: var(--font-cinzel), serif;
}
```

- [ ] **Step 3: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add IMK/src/app/layout.tsx IMK/src/app/globals.css
git commit -m "feat: add Cinzel font for level display"
```

---

## Task 4: DashboardHeader component

**Files:**
- Create: `src/features/dashboard/dashboard-header.tsx`

- [ ] **Step 1: Create dashboard-header.tsx**

```typescript
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  displayName: string;
  avatarUrl: string | null;
  currentStreak: number;
};

export function DashboardHeader({ displayName, avatarUrl, currentStreak }: Props) {
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="sticky top-0 z-30 border-b bg-background px-6 py-4">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="size-10 ring-2 ring-amber-400">
            <AvatarImage src={avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback className="bg-amber-100 text-amber-800 text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold leading-tight">
              Greetings, {displayName.split(" ")[0]}! 👋
            </p>
            <p className="text-xs text-muted-foreground leading-tight">
              Let&apos;s continue your Greek journey.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-semibold text-orange-700 ring-1 ring-orange-200">
          🔥
          <span>{currentStreak}</span>
          <span className="text-xs font-normal text-orange-500">Day streak</span>
        </div>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add IMK/src/features/dashboard/dashboard-header.tsx
git commit -m "feat: add DashboardHeader component"
```

---

## Task 5: StreakCard component

**Files:**
- Create: `src/features/dashboard/streak-card.tsx`

- [ ] **Step 1: Create streak-card.tsx**

```typescript
import { getWeekDays } from "@/features/dashboard/helpers";
import { cn } from "@/lib/utils";

type Props = {
  currentStreak: number;
  practicedDates: Date[];
};

export function StreakCard({ currentStreak, practicedDates }: Props) {
  const weekDays = getWeekDays(practicedDates);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-12 items-center justify-center rounded-full bg-amber-100 text-2xl">
          🦉
        </div>
        <div>
          <p className="text-sm font-semibold">Daily Streak</p>
          <p className="text-xs text-muted-foreground">
            {currentStreak > 0
              ? "You're on a streak, keep it up!"
              : "Practice today to start a streak!"}
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-xs text-muted-foreground">{day.label}</span>
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-xs font-semibold",
                day.practiced
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {day.practiced ? "✓" : ""}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted-foreground">
        Consistency is the key to fluency ✨
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add IMK/src/features/dashboard/streak-card.tsx
git commit -m "feat: add StreakCard component"
```

---

## Task 6: LevelProgressCard component

**Files:**
- Create: `src/features/dashboard/level-progress-card.tsx`

- [ ] **Step 1: Create level-progress-card.tsx**

```typescript
import { getLevelTier, getXpProgress } from "@/features/dashboard/helpers";
import { Progress } from "@/components/ui/progress";

type Props = {
  level: number;
  xp: number;
};

export function LevelProgressCard({ level, xp }: Props) {
  const tier = getLevelTier(level);
  const { current, total, toNext } = getXpProgress(xp);
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="font-cinzel text-3xl font-bold text-amber-600">
            Level {level}
          </p>
          <p className="text-sm text-muted-foreground">{tier}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>XP Progress</span>
          <span>
            {current} / {total} XP
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        <p className="text-xs text-muted-foreground">{toNext} XP to next level</p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add IMK/src/features/dashboard/level-progress-card.tsx
git commit -m "feat: add LevelProgressCard component"
```

---

## Task 7: LessonOfTheDayCard component

**Files:**
- Create: `src/features/dashboard/lesson-of-the-day-card.tsx`

- [ ] **Step 1: Create lesson-of-the-day-card.tsx**

```typescript
import Link from "next/link";

import type { DashboardLesson } from "@/features/dashboard/queries";
import { Button } from "@/components/ui/button";

type Props = {
  lesson: DashboardLesson | null;
};

export function LessonOfTheDayCard({ lesson }: Props) {
  if (!lesson) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-sm">
        <p className="text-sm font-semibold">Lesson of the Day</p>
        <p className="mt-2 text-sm text-muted-foreground">No lesson available yet.</p>
        <Button asChild variant="outline" className="mt-4" size="sm">
          <Link href="/learn">Browse Lessons</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="h-36 bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400" />
      <div className="p-5">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Lesson of the Day
        </p>
        <h2 className="text-lg font-semibold leading-snug">{lesson.title}</h2>
        <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
          {lesson.description}
        </p>
        <Button asChild className="mt-4 w-full">
          <Link href={`/learn/${lesson.slug}`}>Start Lesson →</Link>
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add IMK/src/features/dashboard/lesson-of-the-day-card.tsx
git commit -m "feat: add LessonOfTheDayCard component"
```

---

## Task 8: Wire up dashboard page

**Files:**
- Modify: `src/app/(dashboard)/dashboard/page.tsx`

- [ ] **Step 1: Replace dashboard page**

Replace the entire contents of `src/app/(dashboard)/dashboard/page.tsx` with:

```typescript
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProfile, getPracticeHistory, getLessonOfTheDay } from "@/features/dashboard/queries";
import { DashboardHeader } from "@/features/dashboard/dashboard-header";
import { StreakCard } from "@/features/dashboard/streak-card";
import { LevelProgressCard } from "@/features/dashboard/level-progress-card";
import { LessonOfTheDayCard } from "@/features/dashboard/lesson-of-the-day-card";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const [profile, practicedDates, lesson] = await Promise.all([
    getProfile(user.id),
    getPracticeHistory(user.id),
    getLessonOfTheDay(),
  ]);

  if (!profile) redirect("/login");

  return (
    <>
      <DashboardHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        currentStreak={profile.current_streak}
      />
      <div className="mx-auto max-w-5xl space-y-4 px-6 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <StreakCard
            currentStreak={profile.current_streak}
            practicedDates={practicedDates}
          />
          <LevelProgressCard level={profile.level} xp={profile.xp} />
        </div>
        <LessonOfTheDayCard lesson={lesson} />
      </div>
    </>
  );
}
```

- [ ] **Step 2: Run full test suite**

```bash
cd IMK && pnpm test
```

Expected: all tests pass (including the new dashboard-helpers tests)

- [ ] **Step 3: Typecheck**

```bash
cd IMK && pnpm typecheck
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add IMK/src/app/(dashboard)/dashboard/page.tsx
git commit -m "feat: implement Dashboard (Home) page with real Supabase data"
```
