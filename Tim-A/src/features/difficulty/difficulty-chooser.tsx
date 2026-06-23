"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ChartNoAxesColumn,
  Check,
  Clock3,
  Coffee,
  Info,
  Landmark,
  Lightbulb,
  LightbulbOff,
  Timer,
  Trophy,
  X,
} from "lucide-react";

import type { Difficulty } from "@/features/difficulty/rules";
import { cn } from "@/lib/utils";

type DifficultyChooserProps = {
  difficulty: Difficulty;
  lessonId: string;
  confirm?: string | null;
  from?: string | null;
};

const options = [
  {
    value: "standard",
    label: "Casual Mode",
    shortLabel: "Casual Mode",
    icon: Coffee,
    features: [
      { icon: Clock3, label: "No timer" },
      { icon: Lightbulb, label: "Hints available" },
      { icon: BookOpen, label: "Mistakes become guided steps" },
    ],
  },
  {
    value: "competitive",
    label: "Competitive Mode",
    shortLabel: "Competitive",
    icon: Trophy,
    features: [
      { icon: Timer, label: "Timer enabled" },
      { icon: LightbulbOff, label: "No hints" },
      { icon: ChartNoAxesColumn, label: "Scores appear on leaderboard" },
    ],
  },
] as const;

export function DifficultyChooser({
  difficulty,
  lessonId,
  confirm,
  from,
}: DifficultyChooserProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] =
    useState<Difficulty>(difficulty);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const hrefs = useMemo(
    () => ({
      standard: buildLearnHref("standard", lessonId, confirm, from),
      competitive: buildLearnHref("competitive", lessonId, confirm, from),
    }),
    [confirm, from, lessonId],
  );

  function continueWithSelection() {
    router.push(buildLearnHref(selectedDifficulty, lessonId, confirm, from));
    setIsOpen(false);
  }

  const selectedOption = options.find(
    (option) => option.value === selectedDifficulty,
  );

  return (
    <>
      <div className="flex w-full max-w-[526px] items-center justify-start gap-2 sm:gap-3 lg:w-[526px]">
        <div className="grid h-[70px] min-w-0 flex-1 grid-cols-2 rounded-full border border-[#7c571e] bg-[#f8f3ea] p-2 shadow-inner shadow-[#7c571e]/10 lg:w-[449px] lg:flex-none">
          {options.map((option) => (
            <Link
              key={option.value}
              href={hrefs[option.value]}
              className={cn(
                "flex items-center justify-center rounded-full px-2 text-lg font-semibold whitespace-nowrap transition-[background,color,box-shadow,transform] duration-200 ease-out sm:px-3 sm:text-2xl md:text-[28px] xl:text-[32px]",
                difficulty === option.value
                  ? "bg-[#c4924c] text-white shadow-[0_5px_14px_rgba(124,87,30,0.24)]"
                  : "text-[#4f4539] hover:-translate-y-0.5 hover:bg-white/70",
              )}
            >
              {option.shortLabel}
            </Link>
          ))}
        </div>

        <button
          type="button"
          aria-label="Show learning mode differences"
          onClick={() => {
            setSelectedDifficulty(difficulty);
            setIsOpen(true);
          }}
          className="flex size-13 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 border-red-600 bg-white text-red-600 transition-colors hover:border-red-700 hover:text-red-700 focus:outline-none focus:ring-4 focus:ring-red-100 active:bg-red-50 md:size-[58px]"
          title="Show learning mode differences"
        >
          <Info className="size-7 md:size-8" />
        </button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 cursor-default bg-black/45 backdrop-blur-[3px]"
            aria-label="Close learning mode chooser"
            onClick={() => setIsOpen(false)}
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="learning-mode-title"
            className="fixed inset-x-0 bottom-0 max-h-[92vh] overflow-y-auto rounded-t-[30px] border border-[#eadcc8] bg-[#fffaf2] px-6 pb-7 pt-9 shadow-[0_-22px_60px_rgba(31,24,18,0.22)] animate-in fade-in slide-in-from-bottom-6 duration-300 md:inset-x-auto md:left-1/2 md:top-1/2 md:bottom-auto md:max-h-[96vh] md:w-[min(660px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:overflow-y-auto md:rounded-[28px] md:px-8 md:pb-7 md:pt-8 md:shadow-[0_28px_90px_rgba(31,24,18,0.28)] md:slide-in-from-bottom-0 md:zoom-in-95"
          >
            <button
              type="button"
              aria-label="Close learning mode chooser"
              onClick={() => setIsOpen(false)}
              className="absolute right-5 top-5 flex size-10 items-center justify-center rounded-full text-[#4a3524] transition hover:bg-[#f3eadc] focus:outline-none focus:ring-4 focus:ring-[#d5a451]/25"
            >
              <X className="size-6" />
            </button>

            <div className="mx-auto mb-4 flex size-[72px] items-center justify-center rounded-full border border-[#ead6b7] bg-white text-[#c4924c] shadow-[0_8px_24px_rgba(196,146,76,0.18)]">
              <Landmark className="size-9" strokeWidth={1.8} />
            </div>

            <div className="text-center">
              <h2
                id="learning-mode-title"
                className="font-cinzel text-2xl font-bold text-[#21170f] md:text-3xl"
              >
                Choose your learning mode
              </h2>
              <p className="mx-auto mt-2 max-w-[380px] text-base leading-6 text-[#5d5852] md:text-lg md:leading-7">
                Pick how you want to play. You can change this later.
              </p>
            </div>

            <div className="mt-5 space-y-3">
              {options.map((option) => (
                <ModeOption
                  key={option.value}
                  option={option}
                  selected={selectedDifficulty === option.value}
                  onSelect={() => setSelectedDifficulty(option.value)}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={continueWithSelection}
              className="mt-5 flex h-14 w-full items-center justify-center rounded-[12px] bg-[#bd862c] px-4 text-lg font-bold text-white shadow-[0_10px_18px_rgba(124,87,30,0.25)] transition hover:-translate-y-0.5 hover:bg-[#a8731f] focus:outline-none focus:ring-4 focus:ring-[#d5a451]/30 active:scale-[0.99] md:text-xl"
            >
              Continue with {selectedOption?.label ?? "Casual Mode"}
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}

function ModeOption({
  option,
  selected,
  onSelect,
}: {
  option: (typeof options)[number];
  selected: boolean;
  onSelect: () => void;
}) {
  const Icon = option.icon;

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        "group relative grid w-full grid-cols-[60px_1fr_30px] gap-4 rounded-[16px] border bg-white/72 p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#c4924c] hover:shadow-[0_12px_28px_rgba(124,87,30,0.12)] focus:outline-none focus:ring-4 focus:ring-[#d5a451]/25 md:grid-cols-[72px_1fr_36px] md:gap-5 md:p-5",
        selected
          ? "border-[#c4924c] bg-[#fff8ed] shadow-[0_12px_28px_rgba(124,87,30,0.12)]"
          : "border-[#ded6cc]",
      )}
    >
      <span
        className={cn(
          "flex size-[60px] items-center justify-center rounded-full bg-[#f5eddf] md:size-[72px]",
          selected ? "text-[#bd862c]" : "text-[#795f49]",
        )}
      >
        <Icon className="size-8 md:size-9" strokeWidth={1.8} />
      </span>

      <span className="min-w-0">
        <span className="block text-xl font-bold leading-tight text-[#21170f] md:text-2xl">
          {option.label}
        </span>
        <span className="mt-2 block space-y-2 text-sm leading-5 text-[#2f2d2a] md:text-base md:leading-6">
          {option.features.map((feature) => {
            const FeatureIcon = feature.icon;

            return (
              <span key={feature.label} className="flex items-center gap-2.5">
                <FeatureIcon
                  className={cn(
                    "size-4 shrink-0 md:size-5",
                    selected ? "text-[#bd862c]" : "text-[#323232]",
                  )}
                  strokeWidth={1.8}
                />
                <span>{feature.label}</span>
              </span>
            );
          })}
        </span>
      </span>

      <span
        className={cn(
          "mt-1 flex size-7 items-center justify-center rounded-full border transition md:size-9",
          selected
            ? "border-[#bd862c] bg-[#bd862c] text-white"
            : "border-[#c7bfb5] bg-white text-transparent group-hover:border-[#c4924c]",
        )}
      >
        <Check className="size-4 md:size-5" strokeWidth={2.4} />
      </span>
    </button>
  );
}

function buildLearnHref(
  difficulty: Difficulty,
  lessonId: string,
  confirm?: string | null,
  from?: string | null,
) {
  const params = new URLSearchParams();
  params.set("difficulty", difficulty);
  params.set("lesson", lessonId);

  if (confirm) {
    params.set("confirm", confirm);
  }

  if (from) {
    params.set("from", from);
  }

  return `/learn?${params.toString()}`;
}
