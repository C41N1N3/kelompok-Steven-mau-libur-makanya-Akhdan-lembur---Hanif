export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function calculateXpReward(baseXp: number, multiplier: number): number {
  return Math.round(baseXp * multiplier);
}

export function updateStreak(
  lastPracticedOn: string | null,
  today: string,
  currentStreak: number,
): { currentStreak: number; longestStreak: number } {
  if (!lastPracticedOn) {
    return { currentStreak: 1, longestStreak: Math.max(1, currentStreak) };
  }

  const last = new Date(`${lastPracticedOn}T00:00:00Z`);
  const current = new Date(`${today}T00:00:00Z`);
  const diffDays = Math.round((current.getTime() - last.getTime()) / 86_400_000);

  if (diffDays === 0) {
    return { currentStreak, longestStreak: currentStreak };
  }

  if (diffDays === 1) {
    const next = currentStreak + 1;
    return { currentStreak: next, longestStreak: next };
  }

  return { currentStreak: 1, longestStreak: Math.max(1, currentStreak) };
}
