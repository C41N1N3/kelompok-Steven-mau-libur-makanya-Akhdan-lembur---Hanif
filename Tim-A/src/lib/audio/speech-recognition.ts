export type GreekSpeechRecognitionEvent = {
  results: ArrayLike<{
    0?: {
      transcript?: string;
    };
  }>;
};

export type GreekSpeechRecognizer = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: GreekSpeechRecognitionEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionConstructor = new () => GreekSpeechRecognizer;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

function getSpeechRecognitionConstructor():
  | SpeechRecognitionConstructor
  | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function isSpeechRecognitionSupported(): boolean {
  return Boolean(getSpeechRecognitionConstructor());
}

export function createGreekSpeechRecognizer(): GreekSpeechRecognizer {
  const Recognition = getSpeechRecognitionConstructor();

  if (!Recognition) {
    throw new Error("Speech recognition is not supported in this browser.");
  }

  const recognizer = new Recognition();
  recognizer.lang = "el-GR";
  recognizer.continuous = false;
  recognizer.interimResults = false;

  return recognizer;
}
