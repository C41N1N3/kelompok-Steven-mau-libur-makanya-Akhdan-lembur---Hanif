export type LeagueId = "bronze" | "silver" | "gold" | "diamond";

export type LeagueOption = {
  id: LeagueId;
  label: string;
  unlocked: boolean;
};

const LEAGUE_ORDER: LeagueId[] = ["bronze", "silver", "gold", "diamond"];

export const LEAGUE_LABELS: Record<LeagueId, string> = {
  bronze: "Bronze League",
  silver: "Silver League",
  gold: "Gold League",
  diamond: "Diamond League",
};

export function getLeagueForRank(rank: number | null): LeagueId {
  if (!rank || rank > 30) return "bronze";
  if (rank > 20) return "silver";
  if (rank > 10) return "gold";
  return "diamond";
}

export function getLeagueOptions(currentLeague: LeagueId): LeagueOption[] {
  const currentIndex = LEAGUE_ORDER.indexOf(currentLeague);

  return LEAGUE_ORDER.map((id, index) => ({
    id,
    label: LEAGUE_LABELS[id],
    unlocked: index <= currentIndex,
  }));
}

export function getLeagueRankRange(
  league: LeagueId,
): { fromRank: number; toRank: number | null } {
  if (league === "diamond") return { fromRank: 1, toRank: 10 };
  if (league === "gold") return { fromRank: 11, toRank: 20 };
  if (league === "silver") return { fromRank: 21, toRank: 30 };
  return { fromRank: 31, toRank: null };
}

export function parseLeague(value: string | undefined): LeagueId | null {
  return LEAGUE_ORDER.includes(value as LeagueId) ? (value as LeagueId) : null;
}
