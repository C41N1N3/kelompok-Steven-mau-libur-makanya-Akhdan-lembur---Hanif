export const AI_LIMIT_ERROR_MESSAGE =
  "AI free limit or quota has been exhausted. Please try again later.";

const LIMIT_PATTERNS = [
  "429",
  "quota",
  "rate limit",
  "rate_limit",
  "resource exhausted",
  "resource has been exhausted",
  "free limit",
  "free tier",
  "too many requests",
];

export function isAiLimitError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return LIMIT_PATTERNS.some((pattern) => message.includes(pattern));
}

export function getAiUserErrorMessage(error: unknown): string {
  if (isAiLimitError(error)) return AI_LIMIT_ERROR_MESSAGE;
  return "AI response failed. Please try again.";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "";
}
