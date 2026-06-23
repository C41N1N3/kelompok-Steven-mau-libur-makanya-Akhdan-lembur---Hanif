import { describe, expect, it, vi } from "vitest";

import {
  GOOGLE_TTS_NOT_CONFIGURED_MESSAGE,
  synthesizeGreekSpeechWithGoogle,
} from "@/lib/audio/google-tts";

describe("Google Greek TTS", () => {
  it("requires a Google TTS API key", async () => {
    await expect(
      synthesizeGreekSpeechWithGoogle("Καλημέρα", {
        accessToken: "",
        apiKey: "",
      }),
    ).rejects.toThrow(GOOGLE_TTS_NOT_CONFIGURED_MESSAGE);
  });

  it("requests Greek MP3 speech from Google with an API key", async () => {
    const fetchJson = {
      audioContent: Buffer.from("mp3-bytes").toString("base64"),
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fetchJson,
    });

    const audio = await synthesizeGreekSpeechWithGoogle("Καλημέρα", {
      apiKey: "test-key",
      fetchImpl: fetchMock,
      voiceName: "el-GR-Chirp3-HD-Aoede",
    });

    expect(audio.toString("utf8")).toBe("mp3-bytes");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://texttospeech.googleapis.com/v1/text:synthesize?key=test-key",
      expect.objectContaining({
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text: "Καλημέρα" },
          voice: {
            languageCode: "el-GR",
            name: "el-GR-Chirp3-HD-Aoede",
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        }),
      }),
    );
  });

  it("can request Greek MP3 speech from Google with an access token", async () => {
    const fetchJson = {
      audioContent: Buffer.from("mp3-bytes").toString("base64"),
    };
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => fetchJson,
    });

    const audio = await synthesizeGreekSpeechWithGoogle("Καλημέρα", {
      accessToken: "ya29.test-token",
      fetchImpl: fetchMock,
      voiceName: "el-GR-Chirp3-HD-Aoede",
    });

    expect(audio.toString("utf8")).toBe("mp3-bytes");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://texttospeech.googleapis.com/v1/text:synthesize",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer ya29.test-token",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: { text: "Καλημέρα" },
          voice: {
            languageCode: "el-GR",
            name: "el-GR-Chirp3-HD-Aoede",
          },
          audioConfig: {
            audioEncoding: "MP3",
          },
        }),
      }),
    );
  });

  it("includes Google error details when synthesis fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: async () =>
        JSON.stringify({
          error: {
            message: "Voice 'el-GR-Chirp3-HD-Aoede' does not exist.",
          },
        }),
    });

    await expect(
      synthesizeGreekSpeechWithGoogle("Καλημέρα", {
        apiKey: "test-key",
        fetchImpl: fetchMock,
      }),
    ).rejects.toThrow(
      "Google Text-to-Speech failed with status 400: Voice 'el-GR-Chirp3-HD-Aoede' does not exist.",
    );
  });
});
