import { describe, expect, it } from "vitest";

import {
  getLeagueForRank,
  getLeagueOptions,
  getLeagueRankRange,
} from "@/features/leaderboard/leagues";

describe("leaderboard leagues", () => {
  it("maps rank ranges to leagues", () => {
    expect(getLeagueForRank(42)).toBe("bronze");
    expect(getLeagueForRank(30)).toBe("silver");
    expect(getLeagueForRank(20)).toBe("gold");
    expect(getLeagueForRank(10)).toBe("diamond");
  });

  it("unlocks leagues up to the current league only", () => {
    const options = getLeagueOptions("gold");
    expect(options.map((option) => [option.id, option.unlocked])).toEqual([
      ["bronze", true],
      ["silver", true],
      ["gold", true],
      ["diamond", false],
    ]);
  });

  it("returns rank ranges for each league leaderboard", () => {
    expect(getLeagueRankRange("diamond")).toEqual({ fromRank: 1, toRank: 10 });
    expect(getLeagueRankRange("gold")).toEqual({ fromRank: 11, toRank: 20 });
    expect(getLeagueRankRange("silver")).toEqual({ fromRank: 21, toRank: 30 });
    expect(getLeagueRankRange("bronze")).toEqual({ fromRank: 31, toRank: null });
  });
});
