import { NextResponse } from "next/server";

import type { Difficulty } from "@/features/difficulty/rules";
import type { ConversationReplyMessage } from "@/lib/ai/conversation-replier";
import { getAiUserErrorMessage, isAiLimitError } from "@/lib/ai/errors";
import { getApiUserErrorMessage } from "@/lib/errors/user-facing";
import { replyToConversation } from "@/lib/ai/reply-conversation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

type RequestBody = {
  sessionId?: string;
  messages?: ConversationReplyMessage[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as RequestBody;

  if (!body.sessionId) {
    return NextResponse.json(
      { error: "Conversation could not start. Please refresh and try again." },
      { status: 400 },
    );
  }

  if (!Array.isArray(body.messages)) {
    return NextResponse.json(
      { error: "Conversation could not continue. Please try again." },
      { status: 400 },
    );
  }

  const messages = body.messages.filter(isConversationReplyMessage).slice(-12);

  if (messages.length === 0 || messages.at(-1)?.role !== "user") {
    return NextResponse.json(
      { error: "Please send a message before asking for a reply." },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return NextResponse.json(
      { error: "Please sign in to continue." },
      { status: 401 },
    );
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id, user_id, difficulty, lesson_id")
    .eq("id", body.sessionId)
    .eq("user_id", userResult.user.id)
    .single();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: "Conversation session not found" },
      { status: 404 },
    );
  }

  const { data: items, error: itemsError } = session.lesson_id
    ? await supabase
        .from("lesson_items")
        .select("prompt, scenario_goals")
        .eq("lesson_id", session.lesson_id)
        .eq("kind", "conversation")
        .order("order_index", { ascending: true })
        .limit(1)
    : { data: null, error: null };

  if (itemsError) {
    return NextResponse.json(
      { error: getApiUserErrorMessage(itemsError) },
      { status: 500 },
    );
  }

  let reply;
  try {
    reply = await replyToConversation(
      {
        difficulty: session.difficulty as Difficulty,
        scenario: items?.[0]?.prompt ?? "Conversation practice",
        scenarioGoals: toStringArray(items?.[0]?.scenario_goals ?? []),
        messages,
      },
      {
        provider: process.env.AI_PROVIDER,
      },
    );
  } catch (error) {
    return NextResponse.json(
      { error: getAiUserErrorMessage(error) },
      { status: isAiLimitError(error) ? 429 : 502 },
    );
  }

  return NextResponse.json(reply);
}

function isConversationReplyMessage(
  value: ConversationReplyMessage,
): value is ConversationReplyMessage {
  return (
    (value.role === "assistant" || value.role === "user") &&
    typeof value.text === "string" &&
    value.text.trim().length > 0
  );
}

function toStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
