# GLOSIO Greek Learning App PRD

Date: 2026-05-26
Status: Draft for user review
Figma source: https://www.figma.com/design/rUBG1d3UbdBlRWaz5kX0PV/IMK?node-id=0-1

## 1. Summary

GLOSIO is a responsive Greek learning web app based on the provided IMK Figma design. The first release is a functional multi-user MVP, not a static prototype. Learners can create real accounts, sign in with email/password or Google, complete seeded Greek lessons, practice through multiple learning modes, earn XP and badges, maintain streaks, and compare progress on leaderboards.

The product uses a Supabase-first architecture with Next.js, Tailwind CSS, shadcn/ui, and pnpm. It should be structured for long-term maintainability: features are isolated, data access is centralized, and local errors must not crash unrelated areas of the app.

## 2. Goals

- Build a real learning product that closely follows the GLOSIO desktop and mobile Figma designs.
- Support multi-user authentication with email/password and Google login.
- Provide seeded Greek lesson content with functional progress tracking.
- Include vocabulary, listening, conversation, speaking/recording, and writing practice modes.
- Support difficulty selection, including a competitive mode with timers, health, and higher XP rewards.
- Make XP, levels, streaks, badges, and leaderboards functional in the MVP.
- Support responsive desktop and mobile layouts in one Next.js app.
- Use scalable folder architecture so features can evolve independently.
- Use caching, pagination, and lazy loading so the app remains fast as data grows.

## 3. Non-Goals

- No admin lesson editor in the MVP.
- No paid subscriptions or billing.
- No offline-first mode.
- No multi-language UI; all interface copy is English.
- No per-answer AI pronunciation scoring in normal speaking practice.
- No AI handwriting recognition or handwriting grading in writing practice.
- No separate native mobile app.

## 4. Target Users

- Beginner Greek learners who want short, guided practice sessions.
- Returning learners who care about streaks, XP, badges, and visible progress.
- Students using desktop and mobile browsers interchangeably.

## 5. Technology Baseline

Use current official tooling at implementation time:

- Package manager: pnpm.
- Framework: Next.js App Router with TypeScript.
- Styling: Tailwind CSS v4.
- UI primitives: shadcn/ui with accessible Radix-based components and lucide-react icons.
- Backend: Supabase Auth, Postgres, Storage, and Row Level Security.
- AI integration for transcript-based end-of-conversation scoring, hidden behind a small `lib/ai` adapter so the provider can be swapped later.

Implementation should follow current official setup guidance:

- Next.js app creation with pnpm and App Router defaults.
- Tailwind v4 CSS-first setup.
- shadcn/ui Tailwind v4-compatible installation and `new-york` style defaults.
- Node.js version compatible with the current Next.js requirements.

## 6. Product Scope

### 6.1 Authentication

Users can:

- Register with email/password.
- Log in with email/password.
- Log in with Google.
- Log out.
- View authenticated profile data.
- Change password when using email/password auth.

Auth requirements:

- Use Supabase Auth.
- Protect learner routes from unauthenticated access.
- Redirect signed-out users to the auth flow.
- Keep auth UI aligned with the Figma visual direction.
- Show clear, local form errors.

### 6.2 Dashboard

The dashboard is the learner's home screen.

It should show:

- Greeting and profile summary.
- Current streak.
- XP and level.
- Suggested next lesson.
- Recent progress.
- Badges preview.
- Shortcut cards or actions for learning modes.

Desktop should use the sidebar and header pattern from the Figma. Mobile should use compact headers and bottom navigation.

### 6.3 Lessons

Lessons are seeded by the application, not created through an admin UI.

Lessons include:

- Title and description.
- Difficulty or order.
- Vocabulary items.
- Listening prompts.
- Conversation scenarios.
- Writing prompts.
- Difficulty metadata for standard and competitive practice variants.

Normal users can read lessons and write their own progress only. Seeded lesson content is read-only to learners.

### 6.4 Difficulty And Competitive Mode

Users can choose a practice difficulty before starting supported practice modes.

Difficulty requirements:

- Standard difficulty keeps practice relaxed with normal XP rewards.
- Competitive difficulty increases challenge and gives higher XP rewards.
- Competitive vocabulary, listening, speaking/recording, and writing practice include timers and health.
- Timers create a time limit per question, prompt, or writing attempt depending on the mode.
- Health decreases after incorrect answers, skipped prompts, failed timed attempts, or expired timers.
- A session ends early when health reaches zero.
- Competitive mode should show timer, health, and XP multiplier clearly.
- Competitive mode should never make unrelated UI unstable or block standard mode.

Conversation practice is the exception:

- It does not use timers or health.
- Its competitive or advanced variant makes prompts, required sentence complexity, vocabulary, and scenario expectations harder.
- It grants higher XP when completed.
- AI scoring should consider the selected difficulty when judging the final transcript.

Difficulty and reward rules should be centralized so all practice modes calculate XP consistently.

### 6.5 Vocabulary Practice

Vocabulary practice should support:

- Multiple-choice questions.
- Greek answer options.
- Progress indicator.
- Correct/incorrect feedback.
- XP and progress updates after answers.
- A clear next action.
- Competitive mode with timer, health, and higher XP rewards.

### 6.6 Listening Practice

Listening practice should support:

- Greek prompt playback through audio files or browser-supported text-to-speech.
- Multiple-choice or short response answers.
- Replay controls.
- Progress tracking.
- Graceful fallback if TTS is unsupported.
- Competitive mode with timer, health, and higher XP rewards.

### 6.7 Speaking And Recording Practice

Speaking practice should support:

- Prompt playback.
- Microphone recording.
- User playback of their own recording.
- Retry recording.
- Upload of recording metadata and, where needed, audio files.
- Completion/progress tracking.
- Competitive mode with timer, health, and higher XP rewards.

This mode does not perform AI pronunciation scoring in the MVP.

### 6.8 Conversation Practice

Conversation practice should support:

- A seeded conversation scenario.
- A sequence of prompts and user replies.
- Text transcript capture.
- User voice recording for conversation replies.
- End-of-session transcript-based AI scoring after the full conversation is complete.

AI scoring should evaluate the overall conversation from the final transcript, selected difficulty, and scenario goals. Recorded audio is saved for playback and future audio-aware scoring, but it is not required for MVP scoring. The score should return:

- Overall score.
- Short written feedback.
- Strengths.
- Improvement tips.
- Basic dimensions such as relevance, completeness, fluency, confidence, and speaking quality.

AI scoring happens once after the whole conversation ends, not after each user reply. If AI scoring fails, the completed conversation remains saved and the user can retry scoring later.

Conversation difficulty requirements:

- Standard conversation uses beginner-friendly prompts and shorter expected replies.
- Competitive or advanced conversation uses harder sentences, more advanced vocabulary, and stricter scenario expectations.
- Conversation practice does not use health or timers.
- Higher difficulty conversation sessions grant more XP.

### 6.9 Writing Practice

Writing practice must include a real drawing interaction.

It should support:

- Canvas drawing with mouse, touch, and stylus where available.
- Greek letter or word reference.
- Optional tracing/ghost guide.
- Undo.
- Clear/reset.
- Manual "mark complete" or check flow.
- Saved completion status and attempt metadata.
- Competitive mode with timer, health, and higher XP rewards.

The MVP does not include AI handwriting recognition. Users compare visually and mark completion.

### 6.10 Gamification

Gamification is functional in the MVP.

It includes:

- XP from completed practice actions.
- Levels derived from XP.
- Daily streak updates.
- Badge earning rules.
- Leaderboard rankings.
- Profile stats.
- XP multipliers or reward adjustments based on selected difficulty.

Rules should be centralized and tested so XP, difficulty multipliers, health, timers, streak, badge, and level calculations do not drift across features.

### 6.11 Leaderboard

The leaderboard should show ranked users using safe public profile fields.

It should support:

- Ranking by XP, level, streak, or progress where practical.
- Pagination or limited result windows.
- Current user position.
- Empty and loading states.

### 6.12 Profile And Settings

Profile should show:

- User display name and avatar.
- Level and XP.
- Streak.
- Accuracy or completion stats where available.
- Earned badges.
- Learning history summary.

Settings should include:

- Basic personalization matching the Figma direction.
- Account actions.
- Password change for email/password users.
- Logout.

## 7. UX Requirements

- Match the GLOSIO Greek-learning identity from the Figma.
- Desktop uses sidebar navigation and header profile/streak area.
- Mobile uses bottom navigation and compact headers.
- Practice screens focus on one task at a time.
- Difficulty selection should be clear before a practice session starts.
- Competitive sessions should show timer, health, and XP multiplier without crowding the main task.
- Primary actions must be obvious.
- Forms must show inline validation and clear recovery paths.
- Loading states should be section-level where possible.
- Errors should be recoverable with retry actions.
- Microphone permission denial should not break the route.
- Audio/TTS unavailability should show a contained fallback.
- AI scoring failure should not erase the completed conversation.
- Writing canvas must not shift layout when drawing controls change state.

## 8. Architecture

Use a modular feature architecture.

```txt
src/
  app/
    (auth)/
    (dashboard)/
    api/
  features/
    auth/
    lessons/
    practice/
    conversation/
    speech/
    writing/
    difficulty/
    gamification/
    leaderboard/
    profile/
  components/
    ui/
    layout/
    feedback/
  lib/
    supabase/
    ai/
    audio/
    errors/
    utils/
  server/
    actions/
    queries/
  types/
  data/
    seed/
```

Architecture rules:

- `app/` owns routes, route layouts, loading UI, and route error boundaries.
- `features/*` owns feature-specific UI, hooks, types, validation, and business logic.
- `components/ui` contains shadcn/ui primitives.
- `components/layout` contains app shell, sidebar, bottom nav, and headers.
- `server/actions` owns server mutations.
- `server/queries` owns server reads.
- `lib/supabase` owns Supabase browser/server clients and auth helpers.
- `lib/ai` exposes one conversation scoring interface.
- `lib/audio` owns recording, playback, TTS, and blob utilities.
- `lib/errors` owns shared error mapping and user-facing error helpers.
- Difficulty, timer, health, and XP multiplier rules should be shared across practice modes rather than duplicated.
- Feature components should not scatter raw Supabase queries throughout the UI.

## 9. Error Isolation

The app should be designed so one failure does not ruin unrelated features.

Requirements:

- Major route groups include `loading.tsx` and `error.tsx`.
- Feature widgets include local fallback UI for recoverable failures.
- Supabase calls return typed success/error results or throw only at controlled boundaries.
- Audio recording failures are contained inside speech/writing/conversation UI.
- Leaderboard failures do not block lessons.
- AI scoring failures do not block viewing the completed conversation transcript.
- Writing canvas failures do not block other practice modes.

## 10. Data Model

Initial Supabase tables:

- `profiles`
  - User-facing profile fields tied to Supabase auth user ID.
  - Display name, avatar URL, XP, level, streak fields, timestamps.
- `lessons`
  - Seeded lesson metadata.
- `lesson_items`
  - Seeded prompts and answers for vocabulary, listening, conversation, and writing.
- `lesson_item_difficulties`
  - Optional difficulty-specific prompt variants, timers, health settings, XP multipliers, and conversation complexity metadata.
- `practice_sessions`
  - One row per user practice session, including selected difficulty, competitive state, starting health, ending health, timer outcomes, and earned XP.
- `practice_answers`
  - User answers, correctness, transcript entries, completion state, time spent, and health impact where relevant.
- `recordings`
  - Supabase Storage object references and metadata for user recordings.
- `conversation_scores`
  - AI score, feedback, scoring dimensions, provider metadata, retry status.
- `badges`
  - Seeded badge definitions.
- `user_badges`
  - Earned badges per user.
- `leaderboard_snapshots` or database view
  - Ranked XP, streak, level, or progress data using safe public fields.

Row Level Security:

- Users can read and update only their own private progress, answers, sessions, recordings, and profile details.
- Public leaderboard exposes only safe public fields.
- Lessons and badges are readable by authenticated users.
- Lessons and badges are not writable by normal users.
- Storage paths for recordings are user-scoped.

## 11. Performance And Data Loading

Performance is part of the MVP definition.

Requirements:

- Use server rendering where useful for stable lesson and badge data.
- Cache mostly-static seeded lesson and badge data with sensible revalidation.
- Use pagination or limited queries for leaderboards, practice history, badges, and large lesson lists.
- Avoid fetching all progress data on every page.
- Keep user-specific dashboard data scoped to the dashboard.
- Lazy-load browser-only features such as microphone recording, writing canvas tools, and AI score panels.
- Load signed audio playback URLs only when needed.
- Use skeletons and loading states per page section.
- Use optimistic UI only for low-risk actions, such as answer selection or marking writing complete.
- Use query helpers so data requirements are explicit per route or feature.

## 12. AI Scoring

Conversation scoring is the only AI feature in the MVP.

The scoring integration should:

- Run after the whole conversation is complete.
- Receive transcript text, selected conversation difficulty, and scenario goals.
- Return structured scoring data.
- Store results in `conversation_scores`.
- Be hidden behind `lib/ai` so the provider can change later.
- Support retry if scoring fails.
- Avoid blocking session completion.

The MVP should keep prompts and output simple. It should not attempt detailed pronunciation or audio-aware analysis.

## 13. Audio And Browser APIs

Audio requirements:

- Use browser microphone APIs for recording.
- Detect unsupported recording capability.
- Request microphone permission only when needed.
- Allow retry after permission or recording failure.
- Provide local playback before or after upload where practical.
- Use Supabase Storage for persisted recordings.
- Use TTS or seeded audio for Greek prompts.

Browser-only audio and canvas code should be isolated from server components.

## 14. Testing And Quality

Required checks:

- Type checking.
- Linting.
- Production build.
- Unit tests for pure gamification and progress logic.
- Tests for XP, levels, streaks, badge eligibility, and scoring normalization.
- Tests for difficulty multipliers, timer expiration behavior, health changes, and competitive session completion.
- Focused tests for answer selection and practice completion logic.
- Tests for writing canvas controls where practical.
- Tests for recording state transitions where practical.
- Integration tests for Supabase query/action boundaries where practical.
- End-to-end coverage for critical flows:
  - Register/login.
  - Google login path where mockable.
  - Complete a lesson.
  - Record and play back audio.
  - Finish conversation and receive AI score.
  - View leaderboard and profile.
- Accessibility checks for forms, navigation, focus states, labels, and contrast.
- Responsive verification for desktop and mobile layouts.

## 15. Acceptance Criteria

The MVP is acceptable when:

- A new user can sign up or sign in with Google.
- An authenticated user can complete seeded lessons.
- Vocabulary, listening, speaking, conversation, and writing practice modes work.
- Conversation practice produces an end-of-session AI score or a recoverable retry state.
- Conversation practice supports harder advanced prompts without timers or health.
- Speaking practice supports recording and playback without AI scoring.
- Writing practice supports actual drawing on canvas.
- Supported non-conversation practice modes can run in competitive mode with timers, health, and higher XP rewards.
- XP, levels, streaks, badges, progress, and leaderboard data update from real user activity.
- Desktop and mobile layouts are usable and aligned with the Figma direction.
- Supabase RLS prevents users from accessing other users' private data.
- Large lists use pagination or query limits.
- Static or mostly-static data is cached where appropriate.
- Feature failures are contained with local fallback UI.
- Type, lint, build, and relevant tests pass.

## 16. Open Implementation Notes

- Final exact versions should be resolved at scaffold time with `pnpm create next-app@latest` and `pnpm dlx shadcn@latest`.
- AI provider selection can be finalized during implementation planning, but the app should depend only on the `lib/ai` interface.
- Seed lesson content can start small, but the schema should support adding more lessons without changing core practice flows.
- The referenced `RTK.md` from the workspace AGENTS instructions was not present at `D:\Code\IMK` during PRD creation, so no additional local rules from that file were applied.
