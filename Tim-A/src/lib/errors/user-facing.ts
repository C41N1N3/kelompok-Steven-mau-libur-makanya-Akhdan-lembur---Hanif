const TECHNICAL_PATTERNS = [
  "status 400",
  "status 401",
  "status 403",
  "status 404",
  "status 429",
  "status 500",
  "constraint",
  "column",
  "schema",
  "table",
  "jwt",
  "uuid",
  "invalid input syntax",
  "api key",
  "bearer",
  "oauth",
  "postgres",
  "supabase",
  "row-level security",
  "violates",
  "foreign key",
  "duplicate key",
  "permission denied",
  "relation",
  "failed to fetch",
];

export function getTextToSpeechUserErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);

  if (message.toLowerCase().includes("not configured")) {
    return "Prompt audio is not available yet. Please continue with the text prompt.";
  }

  return "The prompt audio could not be played right now. Please try again later.";
}

export function getPracticeUserErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  if (!isTechnicalMessage(message) && message.trim()) return message;
  return "Practice could not be saved right now. Please try again.";
}

export function getAuthUserErrorMessage(error: unknown): string {
  const message = getErrorMessage(error).toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }

  if (message.includes("already registered") || message.includes("already exists")) {
    return "An account with this email already exists.";
  }

  if (message.includes("email not confirmed")) {
    return "Please confirm your email before signing in.";
  }

  if (message.includes("password")) {
    return "Please check your password and try again.";
  }

  return "Authentication failed. Please try again.";
}

export function getProfileUserErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  if (!isTechnicalMessage(message) && message.trim()) return message;
  return "Your profile changes could not be saved. Please try again.";
}

export function getDashboardUserErrorMessage(): string {
  return "The dashboard could not load. Please try again.";
}

export function getApiUserErrorMessage(error: unknown): string {
  const message = getErrorMessage(error);
  if (!isTechnicalMessage(message) && message.trim()) return message;
  return "Something went wrong. Please try again.";
}

function isTechnicalMessage(message: string): boolean {
  const normalized = message.toLowerCase();
  return TECHNICAL_PATTERNS.some((pattern) => normalized.includes(pattern));
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "";
}
