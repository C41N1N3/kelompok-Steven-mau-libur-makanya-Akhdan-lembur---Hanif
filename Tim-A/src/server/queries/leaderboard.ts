import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import {
  getLeagueForRank,
  getLeagueOptions,
  getLeagueRankRange,
  parseLeague,
  type LeagueId,
} from "@/features/leaderboard/leagues";

export type LeaderboardRow = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
  rank: number;
};

type LeaderboardViewRow = Database["public"]["Views"]["leaderboard"]["Row"];

export async function getLeaderboardPage(
  page = 1,
  pageSize = 20,
  requestedLeague?: string,
) {
  const safePage = Math.max(1, page);
  const safePageSize = Math.min(50, Math.max(1, pageSize));
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("leaderboard")
    .select("*");

  if (error) throw new Error("Leaderboard could not be loaded.");

  const rankedRows = (data ?? []).map((row, index) =>
    normalizeLeaderboardRow(row, index + 1),
  );
  const currentRank =
    rankedRows.find((row) => row.id === user?.id)?.rank ?? null;
  const currentLeague = getLeagueForRank(currentRank);
  const requested = parseLeague(requestedLeague);
  const selectedLeague =
    getLeagueOptions(currentLeague).find(
      (league) => league.id === requested && league.unlocked,
    )?.id ?? currentLeague;
  const leagueRows = getRowsForLeague(rankedRows, selectedLeague);
  const from = (safePage - 1) * safePageSize;
  const to = from + safePageSize;

  return {
    rows: leagueRows.slice(from, to),
    count: leagueRows.length,
    page: safePage,
    pageSize: safePageSize,
    currentRank,
    currentLeague,
    selectedLeague,
  };
}

function getRowsForLeague(
  rows: LeaderboardRow[],
  league: LeagueId,
): LeaderboardRow[] {
  const { fromRank, toRank } = getLeagueRankRange(league);
  return rows.filter((row) => {
    if (row.rank < fromRank) return false;
    return toRank === null || row.rank <= toRank;
  });
}

function normalizeLeaderboardRow(row: LeaderboardViewRow, rank: number): LeaderboardRow {
  return {
    id: row.id ?? "unknown",
    display_name: row.display_name ?? "Learner",
    avatar_url: row.avatar_url,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    current_streak: row.current_streak ?? 0,
    rank,
  };
}
