import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT:${url}`);
  }),
}));

vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      signUp: mocks.signUp,
    },
  })),
}));

import { signUpWithPassword } from "@/features/auth/actions";

describe("signUpWithPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signUp.mockResolvedValue({ data: { session: null }, error: null });
  });

  test("explains when the email is missing", async () => {
    const formData = createSignUpFormData({ email: "" });

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({ error: "Enter your email address." });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  test("explains when the email format is invalid", async () => {
    const formData = createSignUpFormData({ email: "not-an-email" });

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({ error: "Enter a valid email address." });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  test("explains when the password is too short", async () => {
    const formData = createSignUpFormData({ password: "short" });

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({
      error: "Password must be at least 8 characters.",
    });
    expect(mocks.signUp).not.toHaveBeenCalled();
  });

  test("explains when the account already exists", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error("User already registered"),
    });
    const formData = createSignUpFormData();

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({
      error: "An account with this email already exists. Sign in instead.",
    });
  });

  test("explains when Supabase cannot create the profile row", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error("Database error saving new user"),
    });
    const formData = createSignUpFormData();

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({
      error:
        "Account created failed because the profile setup could not be saved. Please try again later.",
    });
  });

  test("explains when signups are disabled", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error("Signups not allowed for this instance"),
    });
    const formData = createSignUpFormData();

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({
      error: "Sign up is currently disabled for this app.",
    });
  });

  test("explains when Supabase email rate limit is reached", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error("Email rate limit exceeded"),
    });
    const formData = createSignUpFormData();

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({
      error: "Too many sign up emails were requested. Please wait a moment and try again.",
    });
  });

  test("keeps Supabase password rule details when password policy rejects it", async () => {
    mocks.signUp.mockResolvedValue({
      data: { session: null },
      error: new Error("Password should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789"),
    });
    const formData = createSignUpFormData();

    const result = await signUpWithPassword(formData);

    expect(result).toEqual({
      error:
        "Password does not meet the password rules: should contain at least one character of each: abcdefghijklmnopqrstuvwxyz, ABCDEFGHIJKLMNOPQRSTUVWXYZ, 0123456789",
    });
  });
});

function createSignUpFormData(
  overrides: Partial<Record<"username" | "email" | "password", string>> = {},
) {
  const formData = new FormData();
  formData.set("username", overrides.username ?? "Michael");
  formData.set("email", overrides.email ?? "michael@example.com");
  formData.set("password", overrides.password ?? "valid-password");
  return formData;
}
