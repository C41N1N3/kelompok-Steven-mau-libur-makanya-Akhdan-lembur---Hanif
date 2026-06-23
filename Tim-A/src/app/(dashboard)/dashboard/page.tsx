import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { getProfile, getPracticeHistory, getLessonOfTheDay } from "@/features/dashboard/queries";
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
    <div className="mx-auto w-full max-w-[1480px] px-5 py-8 md:px-[72px] md:py-[44px]">
      <div className="mb-6 flex items-center gap-6">
        <span className="hidden h-14 w-1 rounded-full bg-[#c89b5b] md:block" />
        <h1 className="text-3xl font-bold text-black md:text-5xl">Homepage</h1>
      </div>

      <div className="grid max-w-[1280px] gap-8 xl:grid-cols-[560px_688px]">
        <StreakCard
          currentStreak={profile.current_streak}
          practicedDates={practicedDates}
        />
        <div className="space-y-8">
          <LevelProgressCard level={profile.level} xp={profile.xp} />
          <LessonOfTheDayCard lesson={lesson} />
        </div>
      </div>
    </div>
  );
}
