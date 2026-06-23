export function getLevelTier(level: number): string {
  if (level <= 5) return "Beginner";
  if (level <= 10) return "Explorer";
  if (level <= 20) return "Greek Explorer";
  return "Master";
}

export function getXpProgress(xp: number): {
  current: number;
  total: number;
  toNext: number;
} {
  const current = xp % XP_PER_LEVEL;
  const total = XP_PER_LEVEL;
  return { current, total, toNext: total - current };
}

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

export function getWeekDays(
  practicedDates: Date[],
  today: Date = new Date(),
): Array<{ label: string; practiced: boolean }> {
  const practicedSet = new Set(
    practicedDates.map((d) => toDateString(d)),
  );

  const startOfWeek = new Date(today);
  const daysSinceMonday = (today.getUTCDay() + 6) % 7;
  startOfWeek.setUTCDate(today.getUTCDate() - daysSinceMonday);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek);
    date.setUTCDate(startOfWeek.getUTCDate() + i);
    return {
      label: DAY_LABELS[i],
      practiced: practicedSet.has(toDateString(date)),
    };
  });
}

const XP_PER_LEVEL = 1000;

function toDateString(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
