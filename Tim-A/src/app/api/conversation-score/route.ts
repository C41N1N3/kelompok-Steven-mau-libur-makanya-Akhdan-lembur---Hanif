import { NextResponse } from "next/server";

import type { Difficulty } from "@/features/difficulty/rules";
import { getAiUserErrorMessage, isAiLimitError } from "@/lib/ai/errors";
import { getApiUserErrorMessage } from "@/lib/errors/user-facing";
import { scoreConversation } from "@/lib/ai/score-conversation";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database";

export async function POST(request: Request) {
  const body = (await request.json()) as { sessionId?: string };

  if (!body.sessionId) {
    return NextResponse.json(
      { error: "Conversation could not be scored. Please refresh and try again." },
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

  const { data: answers, error: answersError } = await supabase
    .from("practice_answers")
    .select("answer_text")
    .eq("session_id", session.id)
    .order("created_at", { ascending: true });

  if (answersError) {
    return NextResponse.json(
      { error: getApiUserErrorMessage(answersError) },
      { status: 500 },
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

  const transcript = (answers ?? [])
    .map((answer) => answer.answer_text)
    .filter(Boolean)
    .join("\n");
  const scenario = items?.[0]?.prompt ?? "Conversation practice";
  const scenarioGoals = toStringArray(items?.[0]?.scenario_goals ?? []);
  let score;
  try {
    score = await scoreConversation(
      {
        sessionId: session.id,
        difficulty: session.difficulty as Difficulty,
        scenario,
        scenarioGoals,
        transcript,
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

  const { error: insertError } = await supabase
    .from("conversation_scores")
    .upsert({
      session_id: session.id,
      user_id: userResult.user.id,
      provider: process.env.AI_PROVIDER ?? "mock",
      overall_score: score.overallScore,
      relevance_score: score.relevanceScore,
      completeness_score: score.completenessScore,
      fluency_score: score.fluencyScore,
      confidence_score: score.confidenceScore,
      speaking_quality_score: score.speakingQualityScore,
      strengths: score.strengths,
      improvement_tips: score.improvementTips,
    });

  if (insertError) {
    return NextResponse.json(
      { error: getApiUserErrorMessage(insertError) },
      { status: 500 },
    );
  }

  return NextResponse.json(score);
}

function toStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
