import { beforeEach, describe, expect, test, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  signOut: vi.fn(),
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
      resetPasswordForEmail: mocks.resetPasswordForEmail,
      updateUser: mocks.updateUser,
      signOut: mocks.signOut,
    },
  })),
}));

import {
  requestPasswordReset,
  updatePasswordFromReset,
} from "@/features/auth/actions";

describe("password reset actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_APP_URL = "https://glosio.example";
    mocks.resetPasswordForEmail.mockResolvedValue({ error: null });
    mocks.updateUser.mockResolvedValue({ error: null });
    mocks.signOut.mockResolvedValue({ error: null });
  });

  test("sends a Supabase reset email back to the reset-password route", async () => {
    const formData = new FormData();
    formData.set("email", "michael@example.com");

    const result = await requestPasswordReset(formData);

    expect(result).toEqual({ sent: true });
    expect(mocks.resetPasswordForEmail).toHaveBeenCalledWith(
      "michael@example.com",
      {
        redirectTo:
          "https://glosio.example/auth/callback?next=%2Freset-password",
      },
    );
  });

  test("requires matching reset passwords before updating Supabase auth", async () => {
    const formData = new FormData();
    formData.set("password", "new-password");
    formData.set("confirm_password", "different-password");

    const result = await updatePasswordFromReset(formData);

    expect(result).toEqual({ error: "Passwords do not match." });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  test("updates the password and redirects to login with a success message", async () => {
    const formData = new FormData();
    formData.set("password", "new-password");
    formData.set("confirm_password", "new-password");

    await expect(updatePasswordFromReset(formData)).rejects.toThrow(
      "NEXT_REDIRECT:/login?password_reset=1",
    );

    expect(mocks.updateUser).toHaveBeenCalledWith({
      password: "new-password",
    });
    expect(mocks.signOut).toHaveBeenCalled();
  });
});
