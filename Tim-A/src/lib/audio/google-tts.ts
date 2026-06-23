import { getGoogleAccessToken } from "@/lib/google/auth";

export const GOOGLE_TTS_NOT_CONFIGURED_MESSAGE =
  "Google Text-to-Speech is not configured. Add Google service account credentials to enable natural Greek audio.";

const DEFAULT_GOOGLE_TTS_VOICE = "el-GR-Chirp3-HD-Aoede";
const GOOGLE_TTS_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";

type SynthesizeGreekSpeechOptions = {
  apiKey?: string;
  accessToken?: string;
  voiceName?: string;
  fetchImpl?: typeof fetch;
};

export async function synthesizeGreekSpeechWithGoogle(
  text: string,
  options: SynthesizeGreekSpeechOptions = {},
): Promise<Buffer> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const apiKey = options.apiKey ?? process.env.GOOGLE_TTS_API_KEY;
  const accessToken = apiKey?.trim()
    ? null
    : await getGoogleAccessToken({
        accessToken: options.accessToken,
        fetchImpl,
      }).catch(() => {
        throw new Error(GOOGLE_TTS_NOT_CONFIGURED_MESSAGE);
      });
  const voiceName =
    options.voiceName ??
    process.env.GOOGLE_TTS_VOICE ??
    DEFAULT_GOOGLE_TTS_VOICE;

  const response = await fetchImpl(getGoogleTtsUrl(apiKey), {
    method: "POST",
    headers: getGoogleTtsHeaders(accessToken),
    body: JSON.stringify({
      input: { text },
      voice: {
        languageCode: "el-GR",
        name: voiceName,
      },
      audioConfig: getAudioConfig(voiceName),
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Google Text-to-Speech failed with status ${response.status}${await getGoogleErrorSuffix(response)}`,
    );
  }

  const payload = (await response.json()) as { audioContent?: string };
  if (!payload.audioContent) {
    throw new Error("Google Text-to-Speech returned an empty audio response.");
  }

  return Buffer.from(payload.audioContent, "base64");
}

async function getGoogleErrorSuffix(response: Response): Promise<string> {
  const body = await response.text().catch(() => "");
  if (!body) return ".";

  try {
    const payload = JSON.parse(body) as {
      error?: {
        message?: string;
      };
    };
    const message = payload.error?.message?.trim();
    return message ? `: ${message}` : ".";
  } catch {
    return `: ${body.slice(0, 300)}`;
  }
}

function getGoogleTtsUrl(apiKey?: string): string {
  if (!apiKey?.trim()) return GOOGLE_TTS_URL;
  return `${GOOGLE_TTS_URL}?key=${encodeURIComponent(apiKey.trim())}`;
}

function getGoogleTtsHeaders(accessToken: string | null): HeadersInit {
  if (!accessToken) {
    return { "Content-Type": "application/json" };
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };
}

function getAudioConfig(voiceName: string) {
  if (voiceName.includes("-Chirp3-HD-")) {
    return { audioEncoding: "MP3" };
  }

  return {
    audioEncoding: "MP3",
    speakingRate: 0.9,
    pitch: 0,
  };
}
