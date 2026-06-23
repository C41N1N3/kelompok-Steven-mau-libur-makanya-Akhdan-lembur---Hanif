import { redirect } from "next/navigation";

import { getLeagueForRank, type LeagueId } from "@/features/leaderboard/leagues";
import { createClient } from "@/lib/supabase/server";

export type ProfileSummaryData = {
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  last_practiced_on: string | null;
  current_league: LeagueId;
  leaderboard_rank: number | null;
};

export async function getCurrentProfile(): Promise<ProfileSummaryData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "display_name, avatar_url, xp, level, current_streak, longest_streak, last_practiced_on",
    )
    .eq("id", user.id)
    .single();

  if (error) throw new Error("Your profile could not be loaded.");
  if (!data) redirect("/login");

  const { data: leaderboardRows, error: leaderboardError } = await supabase
    .from("leaderboard")
    .select("id");

  if (leaderboardError) throw new Error("Your leaderboard rank could not be loaded.");

  const rank =
    (leaderboardRows ?? []).findIndex((row) => row.id === user.id) + 1 || null;

  return {
    ...data,
    current_league: getLeagueForRank(rank),
    leaderboard_rank: rank,
  };
}
