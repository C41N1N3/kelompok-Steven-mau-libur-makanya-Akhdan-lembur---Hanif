export type PracticeMode =
  | "vocabulary"
  | "listening"
  | "speaking"
  | "conversation"
  | "writing";

export type Difficulty = "standard" | "competitive";

export type DifficultyConfig = {
  difficulty: Difficulty;
  usesHealth: boolean;
  startingHealth: number | null;
  timeLimitSeconds: number | null;
  xpMultiplier: number;
};

export function getDifficultyConfig(
  mode: PracticeMode,
  difficulty: Difficulty,
): DifficultyConfig {
  if (difficulty === "standard") {
    return {
      difficulty,
      usesHealth: false,
      startingHealth: null,
      timeLimitSeconds: 15 * 60,
      xpMultiplier: 1,
    };
  }

  if (mode === "conversation") {
    return {
      difficulty,
      usesHealth: false,
      startingHealth: null,
      timeLimitSeconds: 60,
      xpMultiplier: 1.75,
    };
  }

  if (mode === "speaking") {
    return {
      difficulty,
      usesHealth: true,
      startingHealth: 2,
      timeLimitSeconds: 25,
      xpMultiplier: 1.75,
    };
  }

  if (mode === "writing") {
    return {
      difficulty,
      usesHealth: true,
      startingHealth: 2,
      timeLimitSeconds: 20,
      xpMultiplier: 1.5,
    };
  }

  return {
    difficulty,
    usesHealth: true,
    startingHealth: 3,
    timeLimitSeconds: 20,
    xpMultiplier: 1.5,
  };
}

export function applyHealthPenalty(currentHealth: number, delta: number): number {
  return Math.max(0, currentHealth + delta);
}
