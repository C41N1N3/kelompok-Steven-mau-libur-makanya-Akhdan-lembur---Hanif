"use server";

import { revalidatePath } from "next/cache";

import type { Json } from "@/types/database";
import {
  getDifficultyConfig,
  type Difficulty,
  type PracticeMode,
} from "@/features/difficulty/rules";
import {
  calculateLevel,
  calculateXpReward,
  updateStreak,
} from "@/features/gamification/rules";
import { getPracticeUserErrorMessage } from "@/lib/errors/user-facing";
import { createClient } from "@/lib/supabase/server";

export async function startPracticeSession(input: {
  lessonId: string;
  mode: PracticeMode;
  difficulty: Difficulty;
}): Promise<{ sessionId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return { error: "You must be signed in to start practice." };
  }

  const config = getDifficultyConfig(input.mode, input.difficulty);
  const { data, error } = await supabase
    .from("practice_sessions")
    .insert({
      user_id: userResult.user.id,
      lesson_id: input.lessonId,
      mode: input.mode,
      difficulty: input.difficulty,
      starting_health: config.startingHealth,
      ending_health: config.startingHealth,
    })
    .select("id")
    .single();

  if (error) return { error: getPracticeUserErrorMessage(error) };
  return { sessionId: data.id };
}

export async function completePracticeSession(input: {
  sessionId: string;
  baseXp: number;
  multiplier: number;
  endingHealth?: number | null;
}): Promise<{ earnedXp: number; nextLevel: number } | { error: string }> {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return { error: "You must be signed in to complete practice." };
  }

  const { data: profile, error: profileReadError } = await supabase
    .from("profiles")
    .select("xp, current_streak, longest_streak, last_practiced_on")
    .eq("id", userResult.user.id)
    .single();

  if (profileReadError) {
    return { error: getPracticeUserErrorMessage(profileReadError) };
  }

  const earnedXp = calculateXpReward(input.baseXp, input.multiplier);
  const nextXp = profile.xp + earnedXp;
  const nextLevel = calculateLevel(nextXp);
  const today = new Date().toISOString().slice(0, 10);
  const streak = updateStreak(
    profile.last_practiced_on,
    today,
    profile.current_streak,
  );
  const longestStreak = Math.max(profile.longest_streak, streak.longestStreak);

  const { error: sessionError } = await supabase
    .from("practice_sessions")
    .update({
      status: "completed",
      earned_xp: earnedXp,
      ending_health: input.endingHealth,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .eq("user_id", userResult.user.id);

  if (sessionError) return { error: getPracticeUserErrorMessage(sessionError) };

  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      xp: nextXp,
      level: nextLevel,
      current_streak: streak.currentStreak,
      longest_streak: longestStreak,
      last_practiced_on: today,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userResult.user.id);

  if (profileError) return { error: getPracticeUserErrorMessage(profileError) };

  revalidatePath("/dashboard");
  revalidatePath("/learn");
  revalidatePath("/leaderboard");
  revalidatePath("/profile");

  return { earnedXp, nextLevel };
}

export async function failPracticeSession(input: {
  sessionId: string;
  endingHealth?: number | null;
}): Promise<{ ok: true } | { error: string }> {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return { error: "You must be signed in to fail a practice session." };
  }

  const { error } = await supabase
    .from("practice_sessions")
    .update({
      status: "failed",
      ending_health: input.endingHealth,
      completed_at: new Date().toISOString(),
    })
    .eq("id", input.sessionId)
    .eq("user_id", userResult.user.id);

  if (error) return { error: getPracticeUserErrorMessage(error) };

  revalidatePath("/dashboard");
  revalidatePath("/learn");

  return { ok: true };
}

export async function submitPracticeAnswer(input: {
  sessionId: string;
  lessonItemId?: string;
  answerText: string;
  isCorrect?: boolean;
  timeSpentSeconds?: number;
  healthDelta?: number;
  metadata?: Json;
}): Promise<{ answerId: string } | { error: string }> {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return { error: "You must be signed in to submit an answer." };
  }

  const { data, error } = await supabase
    .from("practice_answers")
    .insert({
      session_id: input.sessionId,
      lesson_item_id: input.lessonItemId,
      answer_text: input.answerText,
      is_correct: input.isCorrect,
      time_spent_seconds: input.timeSpentSeconds,
      health_delta: input.healthDelta,
      metadata: input.metadata,
    })
    .select("id")
    .single();

  if (error) return { error: getPracticeUserErrorMessage(error) };
  return { answerId: data.id };
}

export async function uploadPracticeRecording(
  formData: FormData,
): Promise<{ recordingId: string; storagePath: string } | { error: string }> {
  const supabase = await createClient();
  const { data: userResult } = await supabase.auth.getUser();

  if (!userResult.user) {
    return { error: "You must be signed in to upload a recording." };
  }

  const sessionId = String(formData.get("sessionId") ?? "");
  const file = formData.get("recording");
  const durationValue = formData.get("durationSeconds");
  const durationSeconds =
    typeof durationValue === "string" && durationValue.length > 0
      ? Number(durationValue)
      : null;

  if (!sessionId || !(file instanceof File) || file.size === 0) {
    return { error: "Missing recording data." };
  }

  const { data: session, error: sessionError } = await supabase
    .from("practice_sessions")
    .select("id")
    .eq("id", sessionId)
    .eq("user_id", userResult.user.id)
    .single();

  if (sessionError) return { error: getPracticeUserErrorMessage(sessionError) };
  if (!session) return { error: "Practice session was not found." };

  const extension = getAudioExtension(file.type);
  const storagePath = `${userResult.user.id}/${sessionId}/${crypto.randomUUID()}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from("recordings")
    .upload(storagePath, file, {
      contentType: file.type || "audio/webm",
      upsert: false,
    });

  if (uploadError) return { error: getPracticeUserErrorMessage(uploadError) };

  const { data, error } = await supabase
    .from("recordings")
    .insert({
      user_id: userResult.user.id,
      session_id: sessionId,
      storage_path: storagePath,
      mime_type: file.type || "audio/webm",
      duration_seconds: Number.isFinite(durationSeconds)
        ? durationSeconds
        : null,
    })
    .select("id")
    .single();

  if (error) return { error: getPracticeUserErrorMessage(error) };

  return { recordingId: data.id, storagePath };
}

function getAudioExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}
