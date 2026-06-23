import { describe, expect, it, vi } from "vitest";

import {
  createGreekSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "@/lib/audio/speech-recognition";

describe("speech recognition helper", () => {
  it("reports unsupported browsers", () => {
    vi.stubGlobal("SpeechRecognition", undefined);
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    expect(isSpeechRecognitionSupported()).toBe(false);
  });

  it("creates a Greek one-shot recognizer when the browser supports it", () => {
    class FakeSpeechRecognition {
      continuous = true;
      interimResults = true;
      lang = "";
    }

    vi.stubGlobal("SpeechRecognition", FakeSpeechRecognition);
    vi.stubGlobal("webkitSpeechRecognition", undefined);

    const recognizer = createGreekSpeechRecognizer();

    expect(recognizer).toBeInstanceOf(FakeSpeechRecognition);
    expect(recognizer.continuous).toBe(false);
    expect(recognizer.interimResults).toBe(false);
    expect(recognizer.lang).toBe("el-GR");
  });
});
