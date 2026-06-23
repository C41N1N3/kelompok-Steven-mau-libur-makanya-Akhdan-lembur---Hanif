import { NextResponse } from "next/server";

import { getAiUserErrorMessage, isAiLimitError } from "@/lib/ai/errors";
import { synthesizeGreekSpeechWithGoogle } from "@/lib/audio/google-tts";
import { getTextToSpeechUserErrorMessage } from "@/lib/errors/user-facing";

type RequestBody = {
  text?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;
  const text = body.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "text is required" }, { status: 400 });
  }

  try {
    const audio = await synthesizeGreekSpeechWithGoogle(text);
    const body = new Blob([new Uint8Array(audio)], { type: "audio/mpeg" });

    return new Response(body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: isAiLimitError(error)
          ? getAiUserErrorMessage(error)
          : getTextToSpeechUserErrorMessage(error),
      },
      { status: isAiLimitError(error) ? 429 : 502 },
    );
  }
}
