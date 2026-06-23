import { describe, expect, it } from "vitest";

import {
  calculateLevel,
  calculateXpReward,
  updateStreak,
} from "@/features/gamification/rules";

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
