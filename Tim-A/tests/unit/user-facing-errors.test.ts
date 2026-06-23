import { describe, expect, it } from "vitest";

import {
  getAuthUserErrorMessage,
  getDashboardUserErrorMessage,
  getPracticeUserErrorMessage,
  getTextToSpeechUserErrorMessage,
} from "@/lib/errors/user-facing";

describe("user-facing error messages", () => {
  it("hides technical text-to-speech provider details", () => {
    expect(
      getTextToSpeechUserErrorMessage(
        new Error(
          "Google Text-to-Speech failed with status 400: API key not valid. Please pass a valid API key.",
        ),
      ),
    ).toBe(
      "The prompt audio could not be played right now. Please try again later.",
    );
  });

  it("hides Supabase/Postgres details in practice flows", () => {
    expect(
      getPracticeUserErrorMessage(
        new Error('insert violates row-level security policy for table "profiles"'),
      ),
    ).toBe("Practice could not be saved right now. Please try again.");
  });

  it("keeps common auth errors friendly", () => {
    expect(getAuthUserErrorMessage(new Error("Invalid login credentials"))).toBe(
      "Invalid email or password.",
    );
  });

  it("hides dashboard exception details", () => {
    expect(
      getDashboardUserErrorMessage(),
    ).toBe("The dashboard could not load. Please try again.");
  });
});
