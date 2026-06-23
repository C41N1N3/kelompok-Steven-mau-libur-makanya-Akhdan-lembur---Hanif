import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  ChevronRight,
  FileText,
  Headphones,
  MessageCircle,
  PenLine,
  SquareStack,
} from "lucide-react";

import { EmptyState } from "@/components/feedback/empty-state";
import { DifficultyChooser } from "@/features/difficulty/difficulty-chooser";
import { getDifficultyConfig } from "@/features/difficulty/rules";
import { PracticeConfirmation } from "@/features/practice/practice-confirmation";
import { getLessons } from "@/server/queries/lessons";
import { cn } from "@/lib/utils";

type DifficultyChoice = "standard" | "competitive";
type LearnPracticeMode = (typeof practiceModes)[number]["kind"];

const practiceModes = [
  {
    kind: "conversation",
    title: "Conversation Practice",
    description: "Practice real-life conversations.",
    icon: MessageCircle,
    iconAsset: "/figma/learn/conversation-icon.svg",
    tint: "bg-[#edf3fa] text-[#4f80ff]",
    textColor: "text-[#4f80ff]",
    art: "conversation",
  },
  {
    kind: "listening",
    title: "Listening Practice",
    description: "Improve your listening with native audio.",
    icon: Headphones,
    iconAsset: "/figma/learn/headphones-icon.svg",
    tint: "bg-[#f7f3fc] text-[#8b4ff6]",
    textColor: "text-[#8b4ff6]",
    art: "listening",
  },
  {
    kind: "vocabulary",
    title: "Vocabulary Practice",
    description: "Build and review your vocabulary.",
    icon: BookOpen,
    iconAsset: "/figma/learn/book-icon.svg",
    tint: "bg-[#edf8f9] text-[#0096a7]",
    textColor: "text-[#0096a7]",
    art: "vocabulary",
  },
  {
    kind: "writing",
    title: "Writing Practice",
    description: "Learn Greek letters and how to write them.",
    icon: PenLine,
    iconAsset: null,
    tint: "bg-[#f6f2fd] text-[#7848f4]",
    textColor: "text-[#7848f4]",
    art: "writing",
  },
] as const;

export default async function LearnPage({
  searchParams,
}: {
  searchParams: Promise<{
    difficulty?: string;
    confirm?: string;
    lesson?: string;
    from?: string;
  }>;
}) {
  const [{ difficulty: rawDifficulty, confirm, lesson: selectedLessonId, from }, lessons] = await Promise.all([
    searchParams,
    getLessons(),
  ]);
  const difficulty: DifficultyChoice =
    rawDifficulty === "competitive" ? "competitive" : "standard";
  const lesson =
    lessons.find((item) => item.id === selectedLessonId) ?? lessons[0];
  const confirmedMode = isLearnPracticeMode(confirm) ? confirm : null;
  const cancelHref =
    from === "dashboard"
      ? "/dashboard"
      : `/learn?difficulty=${difficulty}&lesson=${lesson.id}`;

  if (!lesson) {
    return (
      <section className="mx-auto max-w-[1480px] px-5 py-8 md:px-[72px] md:py-[44px]">
        <EmptyState
          icon={BookOpen}
          title="No lessons available"
          description="Seed the Supabase lessons table to populate this learning path."
        />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1480px] px-5 py-8 md:px-[72px] md:py-[44px]">
      <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-6">
          <span className="mt-1 hidden h-14 w-1 rounded-full bg-[#c89b5b] md:block" />
          <div>
            <h1 className="text-3xl font-bold text-black md:text-5xl">Learn</h1>
            <p className="mt-2 text-xl text-black">
              Let&apos;s continue your Greek journey.
            </p>
          </div>
        </div>

        <div className="flex w-full justify-center lg:w-auto lg:justify-start">
          <DifficultyChooser
            difficulty={difficulty}
            lessonId={lesson.id}
            confirm={confirmedMode}
            from={from}
          />
        </div>
      </div>

      <div className="space-y-5">
        {practiceModes.map((mode) => {
          const Icon = mode.icon;

          return (
            <Link
              key={mode.kind}
              href={`/learn?difficulty=${difficulty}&lesson=${lesson.id}&confirm=${mode.kind}`}
              className="group relative flex items-center gap-4 rounded-[20px] border border-[#7d6e5c]/15 bg-white p-4 shadow-[0_4px_12px_rgba(79,69,57,0.06)] transition-all hover:-translate-y-0.5 hover:border-[#c89b5b]/40 hover:shadow-[0_6px_20px_rgba(79,69,57,0.1)] md:gap-6 md:p-6 lg:p-8"
            >
              <PracticeGhost kind={mode.art} />
              <div
                className={cn(
                  "relative flex size-16 shrink-0 items-center justify-center rounded-[16px] md:size-[82px] md:rounded-[24px]",
                  mode.tint,
                )}
              >
                {mode.kind === "conversation" && (
                  <span className="absolute -right-1 -top-1 z-10 size-2.5 rounded-full bg-[#ff7a1a] ring-2 ring-white md:-right-1.5 md:-top-1.5 md:size-4" />
                )}
                {mode.iconAsset ? (
                  <Image
                    src={mode.iconAsset}
                    alt=""
                    width={82}
                    height={82}
                    className="size-16 md:size-[82px]"
                  />
                ) : (
                  <Icon className="size-8 md:size-10" strokeWidth={1.9} />
                )}
              </div>
              <div className="relative flex-1 min-w-0">
                <h2 className="text-[18px] font-bold leading-tight text-black md:text-[26px] lg:text-[30px]">
                  {mode.title}
                </h2>
                <p className="mt-1 text-sm leading-snug text-[#4f4539] md:text-base lg:text-lg">
                  {mode.description}
                </p>
              </div>
              <div className="shrink-0 ml-auto flex items-center justify-center">
                <ChevronRight className={cn("size-6 transition-transform group-hover:translate-x-1 md:size-8", mode.textColor)} />
              </div>
            </Link>
          );
        })}
      </div>

      {confirmedMode ? (
        <PracticeConfirmation
          title={getConfirmationTitle(confirmedMode)}
          description={getConfirmationDescription(confirmedMode)}
          config={getDifficultyConfig(confirmedMode, difficulty)}
          mode={confirmedMode}
          questionCount={confirmedMode === "conversation" ? 1 : 5}
          isPending={false}
          startHref={`/practice/${confirmedMode}?lesson=${lesson.id}&difficulty=${difficulty}&start=1`}
          cancelHref={cancelHref}
        />
      ) : null}
    </section>
  );
}

function isLearnPracticeMode(value: string | undefined): value is LearnPracticeMode {
  return practiceModes.some((mode) => mode.kind === value);
}

function getConfirmationTitle(mode: LearnPracticeMode): string {
  const titles: Record<LearnPracticeMode, string> = {
    conversation: "Greek Conversation Practice",
    listening: "Greek Listening Practice",
    vocabulary: "Ancient Greek Proficiency",
    writing: "Greek Writing Practice",
  };
  return titles[mode];
}

function getConfirmationDescription(mode: LearnPracticeMode): string {
  const descriptions: Record<LearnPracticeMode, string> = {
    conversation:
      "Ready to practice a live café conversation? This lesson will help you respond naturally with polite Greek phrases.",
    listening:
      "Ready to sharpen your ear? This lesson will test your ability to understand Greek prompts and choose the right meaning.",
    vocabulary:
      "Ready to test your knowledge? This assessment will evaluate your mastery of classical vocabulary, grammar, and reading comprehension.",
    writing:
      "Ready to practice writing? This lesson will help you trace Greek letters and phrases with more confidence.",
  };
  return descriptions[mode];
}

function PracticeGhost({
  kind,
}: {
  kind: "conversation" | "listening" | "vocabulary" | "writing";
}) {
  if (kind === "conversation") {
    return (
      <div className="pointer-events-none absolute inset-y-0 right-[116px] hidden w-[360px] items-center justify-center opacity-20 md:flex">
        <div className="relative h-[105px] w-[260px] rounded-[34px] bg-[#cfe2fb]">
          <span className="absolute -bottom-4 left-6 size-10 rounded-full bg-[#cfe2fb]" />
          <span className="absolute left-16 top-8 h-3 w-28 rounded-full bg-[#7aa9ea]" />
          <span className="absolute left-16 top-14 h-3 w-20 rounded-full bg-[#7aa9ea]" />
          <span className="absolute -right-24 top-1 text-[68px] font-bold text-[#e0b84e]">
            ?
          </span>
        </div>
      </div>
    );
  }

  if (kind === "listening") {
    return (
      <div className="pointer-events-none absolute inset-y-0 right-[116px] hidden w-[300px] items-center justify-center opacity-20 md:flex">
        <div className="flex items-center gap-3 text-[#8b4ff6]">
          <Headphones className="size-32" strokeWidth={1.5} />
          <div className="flex h-24 items-center gap-1">
            {Array.from({ length: 13 }).map((_, index) => (
              <span
                key={index}
                className="w-1.5 rounded-full bg-current"
                style={{ height: `${18 + (index % 5) * 11}px` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (kind === "vocabulary") {
    return (
      <div className="pointer-events-none absolute inset-y-0 right-[116px] hidden w-[260px] items-center justify-center opacity-20 md:flex">
        <div className="relative h-24 w-36 rotate-[-7deg] rounded-[12px] border-4 border-[#0096a7] bg-[#edf8f9]">
          <span className="absolute left-10 top-6 font-cinzel text-5xl text-[#0096a7]">
            α
          </span>
          <SquareStack className="absolute -right-12 top-1 size-24 rotate-[14deg] text-[#0096a7]" />
        </div>
      </div>
    );
  }

  return (
    <div className="pointer-events-none absolute inset-y-0 right-[116px] hidden w-[250px] items-center justify-center opacity-20 md:flex">
      <div className="relative text-[#7848f4]">
        <FileText className="size-32 rotate-[7deg]" strokeWidth={1.4} />
        <PenLine className="absolute -right-10 -top-2 size-24 rotate-[22deg]" />
      </div>
    </div>
  );
}
