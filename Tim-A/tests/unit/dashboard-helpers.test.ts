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
    expect(result.map((d) => d.label)).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
  });

  it("marks days with practice sessions", () => {
    const today = new Date("2026-05-29"); // Friday
    const practiced = [new Date("2026-05-27"), new Date("2026-05-29")];
    const result = getWeekDays(practiced, today);
    // Index 2 is Wednesday, Index 4 is Friday
    expect(result[2].practiced).toBe(true);
    expect(result[4].practiced).toBe(true);
    expect(result[0].practiced).toBe(false);
  });

  it("marks all days as not practiced when history is empty", () => {
    const today = new Date("2026-05-29");
    const result = getWeekDays([], today);
    expect(result.every((d) => !d.practiced)).toBe(true);
  });

  it("correctly identifies January dates (month boundary)", () => {
    const today = new Date("2026-01-07"); // Wednesday
    const practiced = [new Date("2026-01-05")]; // Monday
    const result = getWeekDays(practiced, today);
    // Current week starts on Jan 5 (Mon), so Monday is index 0.
    const mondayEntry = result[0];
    expect(mondayEntry.practiced).toBe(true);
    expect(result[1].practiced).toBe(false);
  });

  it("keeps Monday first when today is Sunday", () => {
    const today = new Date("2026-06-28"); // Sunday
    const practiced = [new Date("2026-06-22"), new Date("2026-06-28")];
    const result = getWeekDays(practiced, today);
    expect(result.map((d) => d.label)).toEqual(["M", "T", "W", "T", "F", "S", "S"]);
    expect(result[0].practiced).toBe(true);
    expect(result[6].practiced).toBe(true);
  });
});
