import { notFound } from "next/navigation";
import { Construction } from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { ConversationPractice } from "@/features/conversation/conversation-practice";
import {
  getDifficultyConfig,
  type Difficulty,
  type PracticeMode,
} from "@/features/difficulty/rules";
import { ListeningPractice } from "@/features/practice/listening-practice";
import { SessionShell } from "@/features/practice/session-shell";
import { VocabularyPractice } from "@/features/practice/vocabulary-practice";
import { SpeakingPractice } from "@/features/speech/speaking-practice";
import { WritingPractice } from "@/features/writing/writing-practice";
import { getLessonItemsForMode } from "@/server/queries/practice";

const modes = [
  "vocabulary",
  "listening",
  "speaking",
  "conversation",
  "writing",
] satisfies PracticeMode[];

const supportedModes = [
  "vocabulary",
  "listening",
  "speaking",
  "conversation",
  "writing",
] satisfies PracticeMode[];

export default async function PracticeModePage({
  params,
  searchParams,
}: {
  params: Promise<{ mode: string }>;
  searchParams: Promise<{ lesson?: string; difficulty?: string; start?: string }>;
}) {
  const { mode: rawMode } = await params;
  const { lesson, difficulty: rawDifficulty, start } = await searchParams;

  if (!isPracticeMode(rawMode)) notFound();

  const mode = rawMode;
  const difficulty = parseDifficulty(rawDifficulty);
  const config = getDifficultyConfig(mode, difficulty);
  const backHref = `/learn?difficulty=${difficulty}`;
  const autoStart = start === "1";

  if (!lesson) {
    return (
      <SessionShell
        title="Practice"
        subtitle="Choose a lesson before starting a practice session."
        backHref={backHref}
      >
        <EmptyState
          icon={Construction}
          title="No lesson selected"
          description="Open a lesson from the Learn page and choose a practice mode."
        />
      </SessionShell>
    );
  }

  if (!isSupportedMode(mode)) {
    return (
      <SessionShell
        title={formatMode(mode)}
        subtitle="This mode is part of the MVP roadmap and will use the same session engine."
        backHref={backHref}
      >
        <EmptyState
          icon={Construction}
          title={`${formatMode(mode)} is coming next`}
          description="Vocabulary, listening, and speaking practice are available now."
        />
      </SessionShell>
    );
  }

  const items = await getLessonItemsForMode(lesson, mode);

  if (items.length === 0) {
    return (
      <SessionShell
        title={formatMode(mode)}
        subtitle="This lesson does not have prompts for the selected mode yet."
        backHref={backHref}
      >
        <EmptyState
          icon={Construction}
          title="No prompts available"
          description="Add lesson items for this mode in Supabase seed data."
        />
      </SessionShell>
    );
  }

  return (
    <SessionShell
      title={formatMode(mode)}
      subtitle="Practice with focused prompts and earn XP when you finish."
      variant={mode === "conversation" ? "conversation" : "default"}
      backHref={backHref}
    >
      {mode === "vocabulary" ? (
        <VocabularyPractice
          lessonId={lesson}
          difficulty={difficulty}
          config={config}
          items={items}
          autoStart={autoStart}
        />
      ) : null}
      {mode === "listening" ? (
        <ListeningPractice
          lessonId={lesson}
          difficulty={difficulty}
          config={config}
          items={items}
          autoStart={autoStart}
        />
      ) : null}
      {mode === "speaking" ? (
        <SpeakingPractice
          lessonId={lesson}
          difficulty={difficulty}
          config={config}
          items={items}
          autoStart={autoStart}
        />
      ) : null}
      {mode === "conversation" ? (
        <ConversationPractice
          lessonId={lesson}
          difficulty={difficulty}
          config={config}
          items={items}
          autoStart={autoStart}
        />
      ) : null}
      {mode === "writing" ? (
        <WritingPractice
          lessonId={lesson}
          difficulty={difficulty}
          config={config}
          items={items}
          autoStart={autoStart}
        />
      ) : null}
    </SessionShell>
  );
}

function isPracticeMode(mode: string): mode is PracticeMode {
  return modes.includes(mode as PracticeMode);
}

function isSupportedMode(
  mode: PracticeMode,
): mode is (typeof supportedModes)[number] {
  return supportedModes.includes(mode as (typeof supportedModes)[number]);
}

function parseDifficulty(difficulty: string | undefined): Difficulty {
  return difficulty === "competitive" ? "competitive" : "standard";
}

function formatMode(mode: PracticeMode): string {
  return mode.charAt(0).toUpperCase() + mode.slice(1);
}
