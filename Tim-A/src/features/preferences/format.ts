type DatePreferences = {
  date_format: string;
  time_zone: string;
};

const LANGUAGE_CODES: Record<string, string> = {
  English: "en",
  Indonesian: "id",
  Greek: "el",
};

const TIME_ZONE_ALIASES: Record<string, string> = {
  "(GMT+02:00)": "Europe/Athens",
};

export function getLanguageCode(language: string): string {
  return LANGUAGE_CODES[language] ?? "en";
}

export function getDashboardPreferenceStyle(fontSize: number): string {
  const clampedFontSize = Math.min(24, Math.max(10, fontSize));
  const rootFontSize = (clampedFontSize / 12) * 16;
  const zoom = 0.88;

  return `:root { --app-zoom: ${zoom}; } html { font-size: ${formatCssNumber(rootFontSize)}px; }`;
}

export function formatPreferenceDate(
  value: string | null | undefined,
  preferences: DatePreferences,
): string {
  if (!value) return "Not yet";

  const date = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return "Not yet";

  const timeZone = TIME_ZONE_ALIASES[preferences.time_zone] ?? preferences.time_zone;
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);

  const day = parts.find((part) => part.type === "day")?.value ?? "01";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const year = parts.find((part) => part.type === "year")?.value ?? "1970";

  if (preferences.date_format === "MM/DD/YYYY") return `${month}/${day}/${year}`;
  if (preferences.date_format === "YYYY-MM-DD") return `${year}-${month}-${day}`;
  return `${day}/${month}/${year}`;
}

function formatCssNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}
