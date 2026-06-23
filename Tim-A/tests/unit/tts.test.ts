import { describe, expect, it, vi } from "vitest";

import { getBestGreekVoice, speakGreek } from "@/lib/audio/tts";

describe("Greek TTS", () => {
  it("plays generated Greek audio from the app TTS API first", async () => {
    const play = vi.fn().mockResolvedValue(undefined);
    const revokeObjectURL = vi.fn();
    const createObjectURL = vi.fn(() => "blob:greek-audio");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["mp3"]),
    });

    vi.stubGlobal("fetch", fetchMock);
    vi.stubGlobal(
      "Audio",
      vi.fn(function Audio(this: HTMLAudioElement) {
        Object.assign(this, { play });
      }),
    );
    vi.stubGlobal("URL", {
      createObjectURL,
      revokeObjectURL,
    });

    const result = await speakGreek("Καλημέρα");

    expect(result).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledWith("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: "Καλημέρα" }),
    });
    expect(createObjectURL).toHaveBeenCalled();
    expect(play).toHaveBeenCalled();
    expect(globalThis.Audio).toHaveBeenCalledWith("blob:greek-audio");
  });

  it("prefers an exact Greek locale voice", () => {
    const voices = [
      { lang: "en-US", name: "English" },
      { lang: "el-GR", name: "Greek" },
      { lang: "el", name: "Greek Generic" },
    ] as SpeechSynthesisVoice[];

    expect(getBestGreekVoice(voices)?.name).toBe("Greek");
  });

  it("falls back to a Greek language voice", () => {
    const voices = [
      { lang: "en-US", name: "English" },
      { lang: "el", name: "Greek Generic" },
    ] as SpeechSynthesisVoice[];

    expect(getBestGreekVoice(voices)?.name).toBe("Greek Generic");
  });

  it("speaks Greek with a calmer rate and selected voice", async () => {
    const speak = vi.fn();
    const cancel = vi.fn();
    const greekVoice = { lang: "el-GR", name: "Greek" } as SpeechSynthesisVoice;

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      vi.fn(function SpeechSynthesisUtterance(this: SpeechSynthesisUtterance) {
        return this;
      }),
    );
    vi.stubGlobal("speechSynthesis", {
      cancel,
      getVoices: () => [greekVoice],
      speak,
    });

    const result = await speakGreek("Καλημέρα");

    expect(result).toEqual({ ok: true });
    expect(cancel).toHaveBeenCalled();
    expect(speak).toHaveBeenCalledTimes(1);
    const utterance = speak.mock.calls[0][0] as SpeechSynthesisUtterance;
    expect(utterance.lang).toBe("el-GR");
    expect(utterance.voice).toBe(greekVoice);
    expect(utterance.rate).toBe(0.82);
    expect(utterance.pitch).toBe(0.95);
  });

  it("does not speak Greek text with a non-Greek fallback voice", async () => {
    vi.useFakeTimers();
    const speak = vi.fn();
    const cancel = vi.fn();

    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      vi.fn(function SpeechSynthesisUtterance(this: SpeechSynthesisUtterance) {
        return this;
      }),
    );
    vi.stubGlobal("speechSynthesis", {
      cancel,
      getVoices: () => [{ lang: "en-US", name: "English" }],
      onvoiceschanged: null,
      speak,
    });

    const resultPromise = speakGreek("Καλημέρα");
    await vi.runAllTimersAsync();
    const result = await resultPromise;

    expect(result).toEqual({
      ok: false,
      error:
        "Greek text-to-speech voice is not available in this browser. Please install a Greek voice or use recorded audio.",
    });
    expect(speak).not.toHaveBeenCalled();
    expect(cancel).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
