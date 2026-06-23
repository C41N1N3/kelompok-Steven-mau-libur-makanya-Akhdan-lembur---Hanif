"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2, RotateCcw, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PracticeConfirmation } from "@/features/practice/practice-confirmation";
import { ProgressHeader } from "@/features/practice/progress-header";
import { nextProgressValue } from "@/features/practice/progress";
import { useSessionShell } from "@/features/practice/session-shell";
import {
  completePracticeSession,
  failPracticeSession,
  startPracticeSession,
  submitPracticeAnswer,
} from "@/server/actions/practice";
import type { Difficulty, DifficultyConfig } from "@/features/difficulty/rules";
import { applyHealthPenalty } from "@/features/difficulty/rules";
import type { PracticeItem } from "@/server/queries/practice";
import { cn } from "@/lib/utils";

type Props = {
  lessonId: string;
  mode?: "vocabulary" | "listening";
  difficulty: Difficulty;
  config: DifficultyConfig;
  items: PracticeItem[];
  title?: string;
  description?: string;
  autoStart?: boolean;
  renderPromptAction?: (item: PracticeItem) => ReactNode;
};

type AnswerState = "idle" | "correct" | "incorrect";

export function VocabularyPractice({
  lessonId,
  mode = "vocabulary",
  difficulty,
  config,
  items,
  title = "Vocabulary drill",
  description = "Choose the Greek answer that matches each prompt.",
  autoStart = false,
  renderPromptAction,
}: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { setHideHeader } = useSessionShell();

  useEffect(() => {
    setHideHeader(!!sessionId);
    return () => {
      setHideHeader(false);
    };
  }, [sessionId, setHideHeader]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [completed, setCompleted] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>("idle");
  const [health, setHealth] = useState(config.startingHealth);
  const [remainingSeconds, setRemainingSeconds] = useState(
    config.timeLimitSeconds,
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const autoStartRequestedRef = useRef(false);

  const currentItem = items[currentIndex];
  const progress = nextProgressValue(completed, items.length);
  const options = useMemo(() => {
    if (!currentItem) return [];
    if (currentItem.options.length > 0) return currentItem.options;
    return currentItem.answer ? [currentItem.answer] : [];
  }, [currentItem]);

  const failSession = useCallback(
    async (message: string, endingHealth = health) => {
      if (!sessionId) return;

      const response = await failPracticeSession({
        sessionId,
        endingHealth,
      });

      if ("error" in response) {
        setError(response.error);
        return;
      }

      setResult(message);
    },
    [health, sessionId],
  );

  useEffect(() => {
    if (!sessionId || result || !config.timeLimitSeconds) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer);
          startTransition(() => {
            void failSession("Time is up. Try this practice again to earn XP.");
          });
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [config.timeLimitSeconds, failSession, result, sessionId]);

  const beginSession = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const response = await startPracticeSession({
        lessonId,
        mode,
        difficulty,
      });

      if ("error" in response) {
        setError(response.error);
        return;
      }

      setRemainingSeconds(config.timeLimitSeconds);
      setSessionId(response.sessionId);
    });
  }, [config.timeLimitSeconds, difficulty, lessonId, mode]);

  useEffect(() => {
    if (!autoStart || autoStartRequestedRef.current || sessionId || isPending) {
      return;
    }
    autoStartRequestedRef.current = true;
    beginSession();
  }, [autoStart, beginSession, isPending, sessionId]);

  function answer(option: string) {
    if (!currentItem || answerState !== "idle" || !sessionId) return;

    const isCorrect = option === currentItem.answer;
    const healthDelta = !isCorrect && config.usesHealth ? -1 : 0;
    const nextHealth =
      healthDelta < 0 ? applyHealthPenalty(health ?? 0, healthDelta) : health;

    setSelected(option);
    setAnswerState(isCorrect ? "correct" : "incorrect");

    if (config.usesHealth) setHealth(nextHealth);

    startTransition(async () => {
      const response = await submitPracticeAnswer({
        sessionId,
        lessonItemId: currentItem.id,
        answerText: option,
        isCorrect,
        healthDelta,
        metadata: {
          mode,
          difficulty,
          expectedAnswer: currentItem.answer,
        },
      });

      if ("error" in response) {
        setError(response.error);
        return;
      }

      if (!isCorrect && config.usesHealth && nextHealth === 0) {
        await failSession("Out of health. Try again to earn XP.", nextHealth);
      }
    });
  }

  function next() {
    const nextCompleted = completed + 1;
    setCompleted(nextCompleted);
    setSelected(null);
    setSelectedOption(null);
    setAnswerState("idle");

    if (nextCompleted >= items.length) {
      finish();
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function finish() {
    if (!sessionId) return;

    startTransition(async () => {
      const response = await completePracticeSession({
        sessionId,
        baseXp: items.length * 20,
        multiplier: config.xpMultiplier,
        endingHealth: health,
      });

      if ("error" in response) {
        setError(response.error);
        return;
      }

      setResult(`Practice complete. You earned ${response.earnedXp} XP.`);
    });
  }

  function reset() {
    setSessionId(null);
    setCurrentIndex(0);
    setCompleted(0);
    setSelected(null);
    setSelectedOption(null);
    setAnswerState("idle");
    setHealth(config.startingHealth);
    setRemainingSeconds(config.timeLimitSeconds);
    setResult(null);
    setError(null);
  }

  if (result) {
    return (
      <CompletionState message={result} onReset={reset} isPending={isPending} />
    );
  }

  const backHref = `/learn?difficulty=${difficulty}`;

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  function handleMainAction() {
    if (answerState === "idle") {
      if (selectedOption) {
        answer(selectedOption);
      }
    } else {
      next();
    }
  }

  const prefixes = ["A", "B", "C", "D"];

  return (
    <div className="space-y-6">
      {!sessionId ? (
        <>
          <ProgressHeader
            progress={progress}
            config={config}
            health={health}
            remainingSeconds={remainingSeconds}
          />
          <PracticeConfirmation
            title={title}
            description={description}
            config={config}
            mode={mode}
            questionCount={items.length}
            error={error}
            isPending={isPending}
            onStart={beginSession}
          />
        </>
      ) : (
        <div className="mx-auto w-full space-y-6">
          {/* Header Row */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Link
                href={backHref}
                className="flex size-11 items-center justify-center rounded-full border border-[#e7d7c3] bg-white text-[#7c571e] shadow-sm transition-colors hover:bg-[#fbf6f1]"
              >
                <ChevronLeft className="size-6" />
              </Link>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-black">{mode === "vocabulary" ? "Vocabulary Practice" : "Listening Practice"}</h1>
                {remainingSeconds !== null && (
                  <p className="text-lg font-semibold text-[#7c571e] mt-0.5">
                    {formatTime(remainingSeconds)}
                  </p>
                )}
              </div>
              <div className="size-11" /> {/* Spacer */}
            </div>

            {/* Progress Row */}
            <div className="flex items-center gap-4">
              <span className="text-base font-bold text-[#7c571e] whitespace-nowrap">
                {currentIndex + 1}/{items.length}
              </span>
              <Progress
                value={((currentIndex + 1) / items.length) * 100}
                className="h-3 bg-[#e7d7c3] [&>div]:bg-[#c89b5b]"
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="text-center py-6">
            <h2 className="font-cinzel text-[31px] font-bold leading-tight text-[#7c571e]">
              {currentItem.prompt}
            </h2>
            <p className="mt-3 text-lg text-[#4f4539]">
              Select the correct Greek translation from the options below.
            </p>
            {renderPromptAction ? (
              <div className="mt-4 flex justify-center">{renderPromptAction(currentItem)}</div>
            ) : null}
          </div>

          {/* Options Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {options.map((option, index) => {
              const isSelectedOption = selectedOption === option;
              const isSelectedAnswer = selected === option;
              const isCorrect = option === currentItem.answer;

              return (
                <Button
                  key={option}
                  type="button"
                  variant="outline"
                  className={cn(
                    "min-h-[96px] justify-center whitespace-normal rounded-[20px] border-[#e7d7c3] bg-white px-4 py-5 text-center font-cinzel text-2xl text-[#1d1c16] shadow-[0_4px_24px_rgba(156,122,82,0.08)] transition-all hover:border-[#c89b5b] hover:bg-[#fbf6f1]",
                    isSelectedOption &&
                      answerState === "idle" &&
                      "border-[#bd862c] bg-[#fff8ed] shadow-md scale-[1.01]",
                    isSelectedAnswer &&
                      answerState === "correct" &&
                      "border-emerald-500 bg-emerald-50 text-emerald-800",
                    isSelectedAnswer &&
                      answerState === "incorrect" &&
                      "border-destructive/40 bg-destructive/10 text-destructive",
                    answerState !== "idle" &&
                      isCorrect &&
                      "border-emerald-400 bg-emerald-50 text-emerald-800",
                  )}
                  disabled={answerState !== "idle"}
                  onClick={() => {
                    if (answerState === "idle") {
                      setSelectedOption(option);
                    }
                  }}
                >
                  {prefixes[index]}. {option}
                </Button>
              );
            })}
          </div>

          {/* Feedback Banner */}
          {answerState !== "idle" ? (
            <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e7d7c3] bg-[#fbf6f1] p-4">
              <p className={cn(
                "text-lg font-bold",
                answerState === "correct" ? "text-emerald-700" : "text-destructive"
              )}>
                {answerState === "correct" ? "Correct" : "Not quite"}
              </p>
            </div>
          ) : null}

          {/* Submit/Continue Action Button */}
          <div className="mt-8 flex justify-center">
            <Button
              type="button"
              onClick={handleMainAction}
              disabled={(selectedOption === null && answerState === "idle") || isPending}
              className="h-14 w-full max-w-[340px] rounded-full bg-[#bd862c] text-xl font-bold text-[#f6f1e8] shadow-[0_6px_16px_rgba(189,134,44,0.25)] hover:bg-[#a8731f] disabled:opacity-50"
            >
              {answerState === "idle" ? "Submit" : (completed + 1 >= items.length ? "Finish" : "Continue")}
            </Button>
          </div>

          {error ? <p className="text-lg text-destructive">{error}</p> : null}
        </div>
      )}
    </div>
  );
}

function CompletionState({
  message,
  onReset,
  isPending,
}: {
  message: string;
  onReset: () => void;
  isPending: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[#e7d7c3] bg-[#fbf6f1] p-5 text-center">
      <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
      <h2 className="mt-3 font-cinzel text-2xl font-bold text-[#7c571e]">
        Session complete
      </h2>
      <p className="mt-1 text-lg text-[#4f4539]">{message}</p>
      <Button
        type="button"
        variant="outline"
        className="mt-4 rounded-[14px] border-[#7c571e]/30 bg-white text-[#4f4539]"
        onClick={onReset}
        disabled={isPending}
      >
        <RotateCcw className="size-4" />
        Practice again
      </Button>
    </div>
  );
}
