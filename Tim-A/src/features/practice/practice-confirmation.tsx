"use client";

import type { ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Clock3,
  Headphones,
  ListChecks,
  MessageCircle,
  Mic,
  PenTool,
  Star,
  Trophy,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DifficultyConfig, PracticeMode } from "@/features/difficulty/rules";

type Props = {
  title: string;
  description: string;
  config: DifficultyConfig;
  mode?: PracticeMode;
  questionCount?: number;
  error?: string | null;
  isPending: boolean;
  onStart?: () => void;
  startHref?: string;
  cancelHref?: string;
};

export function PracticeConfirmation({
  title,
  description,
  config,
  mode = "vocabulary",
  questionCount,
  error,
  isPending,
  onStart,
  startHref,
  cancelHref,
}: Props) {
  const router = useRouter();
  const Icon = confirmationIcons[mode] ?? Trophy;
  const questions = questionCount ?? 45;
  const estimatedMinutes = config.timeLimitSeconds
    ? Math.max(1, Math.ceil(config.timeLimitSeconds / 60))
    : 30;
  const rewardText =
    config.xpMultiplier > 1 ? "Up to 500 XP" : `Up to ${questions * 10} XP`;
  const showEstimatedTime = mode !== "conversation";
  const backdropClass =
    "fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5 py-16";
  const dialog = (
    <div className="relative mx-auto w-full max-w-[594px] rounded-[30px] border border-[#ded7cf] bg-white px-10 pb-10 pt-[74px] text-center shadow-[0_4px_10px_rgba(0,0,0,0.28)]">
      {/* Close button */}
      <button
        type="button"
        aria-label="Close"
        onClick={() => cancelHref ? router.push(cancelHref) : router.back()}
        className="absolute right-5 top-5 flex size-9 items-center justify-center rounded-full text-[#9a7a58] transition-colors hover:bg-[#f0ece5] hover:text-[#7c571e]"
      >
        <X className="size-5" />
      </button>
      <div className="absolute left-1/2 top-0 flex size-[118px] -translate-x-1/2 -translate-y-[58%] items-center justify-center rounded-full bg-[#f0ece5] text-[#a87932]">
        <Icon className="size-12 stroke-[2.4]" />
      </div>
      <h2 className="font-cinzel text-[30px] font-bold uppercase leading-tight text-[#7c571e]">
        {title}
      </h2>
      <p className="mx-auto mt-5 max-w-[470px] text-lg leading-[1.45] text-[#4f4539]">
        {description}
      </p>

      <div
        className={`mx-auto mt-8 grid max-w-[500px] overflow-hidden rounded-[16px] border border-[#ded7cf] bg-[#f7f3ee] shadow-[0_2px_4px_rgba(0,0,0,0.18)] ${
          showEstimatedTime ? "grid-cols-3" : "grid-cols-2"
        }`}
      >
        {showEstimatedTime ? (
          <ConfirmationStat
            icon={Clock3}
            label="Estimated Time"
            value={`${estimatedMinutes} Minutes`}
            compact
          />
        ) : null}
        <ConfirmationStat
          icon={ListChecks}
          label="Questions"
          value={`${questions} Questions`}
          compact={showEstimatedTime}
        />
        <ConfirmationStat icon={Star} label="Reward" value={rewardText} compact={showEstimatedTime} />
      </div>

      {startHref ? (
        <Button
          asChild
          className="mt-9 h-[52px] w-full max-w-[312px] rounded-full bg-[#ad7c32] text-2xl font-bold text-white shadow-none hover:bg-[#976b2a]"
        >
          <Link href={startHref}>
            Start Lesson
            <ArrowRight className="size-6" />
          </Link>
        </Button>
      ) : (
        <Button
          type="button"
          className="mt-9 h-[52px] w-full max-w-[312px] rounded-full bg-[#ad7c32] text-2xl font-bold text-white shadow-none hover:bg-[#976b2a]"
          onClick={onStart}
          disabled={isPending}
        >
          {isPending ? "Starting..." : "Start Lesson"}
          <ArrowRight className="size-6" />
        </Button>
      )}
      {cancelHref ? (
        <Button
          asChild
          variant="outline"
          className="mt-4 h-[52px] w-full max-w-[312px] rounded-full border-[#bd8b44] bg-white text-2xl font-bold text-[#9a6d28] hover:bg-[#fbf6f1]"
        >
          <Link href={cancelHref}>Maybe Later</Link>
        </Button>
      ) : null}
      {error ? <p className="mt-3 text-lg text-destructive">{error}</p> : null}
    </div>
  );

  if (cancelHref) {
    return (
      <div
        className={backdropClass}
        role="button"
        tabIndex={0}
        onClick={() => router.push(cancelHref)}
        onKeyDown={(event) => {
          if (event.key === "Escape") router.push(cancelHref);
        }}
      >
        <div onClick={(event) => event.stopPropagation()}>{dialog}</div>
      </div>
    );
  }

  return <div className={backdropClass}>{dialog}</div>;
}

function ConfirmationStat({
  icon: Icon,
  label,
  value,
  compact = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className={`flex items-center justify-center border-r border-[#ded7cf] last:border-r-0 ${compact ? "min-h-[58px] gap-2 px-3" : "min-h-[80px] gap-3 px-4"}`}>
      <Icon className={`shrink-0 text-[#bd8b44] ${compact ? "size-5" : "size-8"}`} />
      <div className="text-left">
        <p className={`font-bold text-[#4f4539] ${compact ? "text-[10px]" : "text-[13px]"}`}>{label}</p>
        <p className={`font-bold text-[#1d1c16] ${compact ? "text-[12px]" : "text-base"}`}>{value}</p>
      </div>
    </div>
  );
}

const confirmationIcons: Record<PracticeMode, ComponentType<{ className?: string }>> = {
  vocabulary: BookOpen,
  listening: Headphones,
  speaking: Mic,
  conversation: MessageCircle,
  writing: PenTool,
};
