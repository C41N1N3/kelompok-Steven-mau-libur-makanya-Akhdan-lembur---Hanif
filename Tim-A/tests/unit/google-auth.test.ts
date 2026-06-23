import { describe, expect, it, vi } from "vitest";

import {
  GOOGLE_AUTH_NOT_CONFIGURED_MESSAGE,
  getGoogleAccessToken,
} from "@/lib/google/auth";

describe("Google auth", () => {
  it("requires service account credentials", async () => {
    await expect(
      getGoogleAccessToken({
        clientEmail: "",
        privateKey: "",
      }),
    ).rejects.toThrow(GOOGLE_AUTH_NOT_CONFIGURED_MESSAGE);
  });

  it("uses an explicit access token when provided", async () => {
    await expect(
      getGoogleAccessToken({ accessToken: "ya29.test-token" }),
    ).resolves.toBe("ya29.test-token");
  });

  it("exchanges a signed JWT for an OAuth access token", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "ya29.generated-token" }),
    });
    const privateKey = [
      "-----BEGIN PRIVATE KEY-----",
      "MIIEvQIBADANBgkqhkiG9w0BAQEFAASC",
      "-----END PRIVATE KEY-----",
    ].join("\n");

    const token = await getGoogleAccessToken({
      clientEmail: "tts@test-project.iam.gserviceaccount.com",
      privateKey,
      fetchImpl: fetchMock,
      nowSeconds: 1_700_000_000,
      signJwt: () => "signed.jwt",
    });

    expect(token).toBe("ya29.generated-token");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://oauth2.googleapis.com/token",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:
          "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=signed.jwt",
      }),
    );
  });
});
