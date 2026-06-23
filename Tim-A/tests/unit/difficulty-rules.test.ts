import { describe, expect, it } from "vitest";

import {
  applyHealthPenalty,
  getDifficultyConfig,
} from "@/features/difficulty/rules";

describe("difficulty rules", () => {
  it("sets casual practice to 15 minutes without health", () => {
    const config = getDifficultyConfig("writing", "standard");
    expect(config.usesHealth).toBe(false);
    expect(config.timeLimitSeconds).toBe(15 * 60);
    expect(config.xpMultiplier).toBe(1);
  });

  it("keeps conversation free from health but still timed competitively", () => {
    const config = getDifficultyConfig("conversation", "competitive");
    expect(config.usesHealth).toBe(false);
    expect(config.timeLimitSeconds).toBe(60);
    expect(config.xpMultiplier).toBe(1.75);
  });

  it("uses health and timers for competitive vocabulary", () => {
    const config = getDifficultyConfig("vocabulary", "competitive");
    expect(config.usesHealth).toBe(true);
    expect(config.startingHealth).toBe(3);
    expect(config.timeLimitSeconds).toBe(20);
  });

  it("does not reduce health below zero", () => {
    expect(applyHealthPenalty(1, -2)).toBe(0);
  });
});
