"use server";

import { redirect } from "next/navigation";

import { getAuthUserErrorMessage } from "@/lib/errors/user-facing";
import { createClient } from "@/lib/supabase/server";

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) return { error: getAuthUserErrorMessage(error) };

  redirect("/dashboard");
}

export async function signUpWithPassword(formData: FormData) {
  const email = readString(formData, "email", "");
  const password = readString(formData, "password", "");
  const username = readString(formData, "username", "");

  if (!username) {
    return { error: "Username is required." };
  }

  if (!email) {
    return { error: "Enter your email address." };
  }

  if (!isValidEmail(email)) {
    return { error: "Enter a valid email address." };
  }

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: username,
      },
    },
  });

  if (error) {
    return { error: getSignUpUserErrorMessage(error) };
  }
  if (!data.session) redirect("/login?registered=1");

  redirect("/dashboard");
}

export async function requestPasswordReset(formData: FormData) {
  const email = readString(formData, "email", "");

  if (!email) return { error: "Enter your email address." };

  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
    "/reset-password",
  )}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) return { error: getAuthUserErrorMessage(error) };

  return { sent: true };
}

export async function updatePasswordFromReset(formData: FormData) {
  const password = readString(formData, "password", "");
  const confirmPassword = readString(formData, "confirm_password", "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) return { error: getAuthUserErrorMessage(error) };

  await supabase.auth.signOut();
  redirect("/login?password_reset=1");
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${origin}/auth/callback` },
  });

  if (error) return { error: getAuthUserErrorMessage(error) };
  if (data.url) redirect(data.url);

  return { error: "Google login did not return a redirect URL." };
}

export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();
  redirect("/login");
}

function readString(formData: FormData, key: string, fallback: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSignUpUserErrorMessage(error: unknown): string {
  const rawMessage = getErrorMessage(error);
  const message = rawMessage.toLowerCase();

  if (message.includes("already registered") || message.includes("already exists")) {
    return "An account with this email already exists. Sign in instead.";
  }

  if (message.includes("invalid") && message.includes("email")) {
    return "Enter a valid email address.";
  }

  if (message.includes("database error saving new user")) {
    return "Account created failed because the profile setup could not be saved. Please try again later.";
  }

  if (message.includes("signup") && message.includes("not allowed")) {
    return "Sign up is currently disabled for this app.";
  }

  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many sign up emails were requested. Please wait a moment and try again.";
  }

  if (message.includes("email") && message.includes("send")) {
    return "The confirmation email could not be sent. Please try again later.";
  }

  if (message.includes("password")) {
    if (message.includes("should contain")) {
      return `Password does not meet the password rules: ${stripLeadingPasswordPhrase(rawMessage)}`;
    }

    if (message.includes("weak")) {
      return "Password is too weak. Use a longer password with a mix of letters, numbers, and symbols.";
    }

    return "Password must be at least 8 characters.";
  }

  if (isSafeProviderMessage(rawMessage)) {
    return `Sign up failed: ${rawMessage}`;
  }

  return "Sign up failed because the authentication service rejected the request. Please try again later.";
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

function stripLeadingPasswordPhrase(message: string): string {
  return message.replace(/^password\s*/i, "").trim();
}

function isSafeProviderMessage(message: string): boolean {
  const normalized = message.toLowerCase();

  if (!message.trim()) return false;

  const technicalPatterns = [
    "jwt",
    "postgres",
    "schema",
    "relation",
    "row-level security",
    "violates",
    "constraint",
    "uuid",
    "sql",
    "stack",
    "supabase",
    "database",
  ];

  return !technicalPatterns.some((pattern) => normalized.includes(pattern));
}
