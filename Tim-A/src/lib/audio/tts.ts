const GREEK_VOICE_ERROR =
  "Greek text-to-speech voice is not available in this browser. Please install a Greek voice or use recorded audio.";

export async function speakGreek(
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const generatedAudioResult = await speakGeneratedGreekAudio(text);
  if (generatedAudioResult.ok) return generatedAudioResult;

  const browserResult = await speakGreekWithBrowserVoice(text);
  if (browserResult.ok) return browserResult;

  if (generatedAudioResult.error === "Generated audio is not available.") {
    return browserResult;
  }

  return generatedAudioResult;
}

async function speakGeneratedGreekAudio(
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof window === "undefined" || typeof fetch === "undefined") {
    return { ok: false, error: "Generated audio is not available." };
  }

  try {
    const response = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;
      return {
        ok: false,
        error: payload?.error ?? "Generated audio is not available.",
      };
    }

    const blob = await response.blob();
    const audioUrl = URL.createObjectURL(blob);
    const audio = new Audio(audioUrl);

    audio.onended = () => URL.revokeObjectURL(audioUrl);
    audio.onerror = () => URL.revokeObjectURL(audioUrl);

    await audio.play();
    return { ok: true };
  } catch {
    return { ok: false, error: "Generated audio is not available." };
  }
}

async function speakGreekWithBrowserVoice(
  text: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return {
      ok: false,
      error: "Text-to-speech is not supported in this browser.",
    };
  }

  const voice = await waitForGreekVoice(window.speechSynthesis);
  if (!voice) {
    return {
      ok: false,
      error: GREEK_VOICE_ERROR,
    };
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "el-GR";
  utterance.rate = 0.82;
  utterance.pitch = 0.95;
  utterance.volume = 1;
  utterance.voice = voice;

  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);

  return { ok: true };
}

export function getBestGreekVoice(
  voices: SpeechSynthesisVoice[],
): SpeechSynthesisVoice | undefined {
  return (
    voices.find((voice) => voice.lang.toLowerCase() === "el-gr") ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith("el"))
  );
}

function waitForGreekVoice(
  synthesis: SpeechSynthesis,
): Promise<SpeechSynthesisVoice | undefined> {
  const currentVoice = getBestGreekVoice(synthesis.getVoices());
  if (currentVoice) return Promise.resolve(currentVoice);

  return new Promise((resolve) => {
    const previousHandler = synthesis.onvoiceschanged;

    const finish = () => {
      window.clearTimeout(timeoutId);
      synthesis.onvoiceschanged = previousHandler;
      resolve(getBestGreekVoice(synthesis.getVoices()));
    };

    const timeoutId = window.setTimeout(finish, 1000);

    synthesis.onvoiceschanged = (event) => {
      if (typeof previousHandler === "function") {
        previousHandler.call(synthesis, event);
      }
      finish();
    };
  });
}
