import { describe, expect, it } from "vitest";

import { getSafeAuthRedirectPath } from "@/app/auth/callback/route";

describe("getSafeAuthRedirectPath", () => {
  it("keeps internal redirect paths", () => {
    expect(getSafeAuthRedirectPath("/learn", "https://app.example")).toBe(
      "/learn",
    );
    expect(
      getSafeAuthRedirectPath(
        "/learn?level=alpha#lesson",
        "https://app.example",
      ),
    ).toBe("/learn?level=alpha#lesson");
  });

  it("falls back for off-site redirects", () => {
    expect(
      getSafeAuthRedirectPath(
        "https://evil.example/phish",
        "https://app.example",
      ),
    ).toBe("/dashboard");
    expect(
      getSafeAuthRedirectPath("//evil.example/phish", "https://app.example"),
    ).toBe("/dashboard");
  });

  it("falls back for backslash redirect attempts", () => {
    expect(
      getSafeAuthRedirectPath("/\\evil.example/path", "https://app.example"),
    ).toBe("/dashboard");
    expect(
      getSafeAuthRedirectPath("/%5Cevil.example/path", "https://app.example"),
    ).toBe("/dashboard");
    expect(
      getSafeAuthRedirectPath("/%5cevil.example/path", "https://app.example"),
    ).toBe("/dashboard");
  });
});
