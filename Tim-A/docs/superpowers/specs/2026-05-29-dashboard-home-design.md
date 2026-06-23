# Dashboard (Home) — Design Spec

**Date:** 2026-05-29
**Branch:** codex/glosio-functional-mvp
**Status:** Approved

---

## Overview

Implement the Dashboard (Home) screen for GLOSIO, the Greek language learning app. The screen is the first thing an authenticated user sees after login. It surfaces personal progress at a glance and drives the user toward their next lesson.

Reference: Figma node `12:645` — "Dashboard (Home)" frame inside "Prototype (Laptop)" section.

---

## Architecture & Data Flow

`src/app/(dashboard)/dashboard/page.tsx` is a React Server Component. It fetches all required data in parallel before rendering:

```ts
const [profile, practiceHistory, lessonOfTheDay] = await Promise.all([
  getProfile(userId),
  getPracticeHistory(userId),
  getLessonOfTheDay(),
])
```

Results are passed as props to presentational child components. No client-side fetching, no loading skeletons — data is ready at render time.

### Query functions

Location: `src/features/dashboard/queries.ts`

| Function | Source | Returns |
|---|---|---|
| `getProfile(userId)` | `public.profiles` | `display_name`, `avatar_url`, `xp`, `level`, `current_streak` |
| `getPracticeHistory(userId)` | `public.practice_sessions` | Array of `started_at` dates for the last 7 days |
| `getLessonOfTheDay()` | `public.lessons` | Single lesson with lowest `order_index` |

Uses `src/lib/supabase/server.ts` (already exists).

---

## Component Tree

```
src/app/(dashboard)/dashboard/page.tsx   ← Server Component
src/features/dashboard/
├── queries.ts                           ← Data fetching
├── dashboard-header.tsx                 ← Avatar, greeting, streak badge
├── streak-card.tsx                      ← Weekly dots, owl, quote
├── level-progress-card.tsx              ← Level, tier title, XP bar
└── lesson-of-the-day-card.tsx           ← Hero, title, description, CTA
```

---

## Component Specs

### `DashboardHeader`

Props: `displayName`, `avatarUrl`, `currentStreak`

- **Left:** circular avatar (`Avatar` from shadcn, fallback to initials), display name, subtitle "Let's continue your Greek journey."
- **Right:** streak badge — 🔥 + `currentStreak` + "Day streak"
- Sticky top, background matches theme, thin border-bottom

### `StreakCard`

Props: `practicedDates: Date[]`, `currentStreak`

- Owl mascot: 🦉 emoji placeholder (asset can be swapped later)
- 7 day circles (M T W T F S S) — amber/orange filled if user practiced that day, muted/empty otherwise
- Days derived from today − 6 days to today
- Quote: *"Consistency is the key to fluency ✨"*

### `LevelProgressCard`

Props: `level`, `xp`

- Large level number using serif font (Cinzel via `next/font/google`, fallback serif)
- Tier title derived from level:
  - 1–5 → "Beginner"
  - 6–10 → "Explorer"
  - 11–20 → "Greek Explorer"
  - 21+ → "Master"
- XP progress bar: `xp % 1000` out of 1000 (1000 XP per level)
- Labels: `{xp % 1000} / 1000 XP` and `{1000 − (xp % 1000)} XP to next level`

### `LessonOfTheDayCard`

Props: `lesson: { slug, title, description } | null`

- Placeholder gradient hero image (replaceable with real asset later)
- Lesson title + description (truncated to 2 lines)
- "Start Lesson" button → navigates to `/learn/[slug]`
- If `lesson` is null: shows "No lesson available" state with link to `/learn`

---

## Layout

- **Mobile (default):** single column, full-width cards stacked vertically
- **`md` and above:** 2-column grid — StreakCard + LevelProgressCard side by side, LessonOfTheDayCard full width below

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `getProfile` returns null | Redirect to `/login` |
| `current_streak` = 0 | Streak badge shows "0 Day streak"; all day circles empty |
| No lessons in DB | LessonOfTheDayCard shows "No lesson available" + link to `/learn` |
| `avatar_url` null or broken | shadcn `Avatar` renders initials from `display_name` |
| `xp` = 0 | Progress bar 0%, label "0 / 1000 XP" |
| Auth error during fetch | Caught by Next.js `error.tsx` boundary |

---

## Out of Scope

- Practice session creation (handled in Learn feature)
- Real-time streak updates after practice (next iteration)
- Lesson of the Day rotation logic (always lowest `order_index` for now)
- Owl mascot asset (placeholder emoji)
- Hero image for lesson card (placeholder gradient)
