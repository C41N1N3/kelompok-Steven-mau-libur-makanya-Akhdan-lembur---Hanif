"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, CheckCircle2, PenTool, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Difficulty, DifficultyConfig } from "@/features/difficulty/rules";
import { getPersistedLessonItemId } from "@/features/practice/dummy-items";
import { PracticeConfirmation } from "@/features/practice/practice-confirmation";
import { ProgressHeader } from "@/features/practice/progress-header";
import { nextProgressValue } from "@/features/practice/progress";
import { useSessionShell } from "@/features/practice/session-shell";
import { DrawingCanvas } from "@/features/writing/drawing-canvas";
import {
  canAdvanceWritingQuestion,
  evaluateWritingSubmission,
} from "@/features/writing/feedback";
import { getWritingOutline } from "@/features/writing/outline";
import {
  completePracticeSession,
  failPracticeSession,
  startPracticeSession,
  submitPracticeAnswer,
} from "@/server/actions/practice";
import type { PracticeItem } from "@/server/queries/practice";

type Props = {
  lessonId: string;
  difficulty: Difficulty;
  config: DifficultyConfig;
  items: PracticeItem[];
  autoStart?: boolean;
};

export function WritingPractice({
  lessonId,
  difficulty,
  config,
  items,
  autoStart = false,
}: Props) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const { setHideHeader } = useSessionShell();

  useEffect(() => {
    setHideHeader(!!sessionId);
    return () => {
      setHideHeader(false);
    };
  }, [sessionId, setHideHeader]);

  const [hasDrawing, setHasDrawing] = useState(false);
  const [drawingSnapshot, setDrawingSnapshot] = useState("[]");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [submittedItems, setSubmittedItems] = useState<Set<string>>(() => new Set());
  const [feedbackByItem, setFeedbackByItem] = useState<
    Record<string, ReturnType<typeof evaluateWritingSubmission>>
  >({});
  const [remainingSeconds, setRemainingSeconds] = useState(
    config.timeLimitSeconds,
  );
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const autoStartRequestedRef = useRef(false);
  const item = items[currentIndex];
  const currentItemKey = item?.id ?? String(currentIndex);
  const hasSubmittedCurrentItem = submittedItems.has(currentItemKey);
  const writingOutline = getWritingOutline(item?.greek, difficulty);
  const currentFeedback = feedbackByItem[currentItemKey];
  const canAdvanceCurrentItem = currentFeedback
    ? canAdvanceWritingQuestion(currentFeedback, difficulty)
    : false;

  const failSession = useCallback(async () => {
    if (!sessionId) return;

    const response = await failPracticeSession({
      sessionId,
      endingHealth: config.startingHealth,
    });

    if ("error" in response) {
      setError(response.error);
      return;
    }

    setResult("Time is up. Try this writing practice again to earn XP.");
  }, [config.startingHealth, sessionId]);

  useEffect(() => {
    if (!sessionId || result || !config.timeLimitSeconds) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [config.timeLimitSeconds, result, sessionId]);

  useEffect(() => {
    if (remainingSeconds !== 0 || !sessionId || result) return;
    startTransition(() => {
      void failSession();
    });
  }, [remainingSeconds, sessionId, result, failSession]);

  const beginSession = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const response = await startPracticeSession({
        lessonId,
        mode: "writing",
        difficulty,
      });

      if ("error" in response) {
        setError(response.error);
        return;
      }

      setRemainingSeconds(config.timeLimitSeconds);
      setSessionId(response.sessionId);
    });
  }, [config.timeLimitSeconds, difficulty, lessonId]);

  useEffect(() => {
    if (!autoStart || autoStartRequestedRef.current || sessionId || isPending) {
      return;
    }
    autoStartRequestedRef.current = true;
    beginSession();
  }, [autoStart, beginSession, isPending, sessionId]);

  function submitCurrent() {
    if (!sessionId) return;
    setError(null);
    const feedback = evaluateWritingSubmission(
      drawingSnapshot,
      item?.answer ?? item?.greek,
    );

    startTransition(async () => {
      const answer = await submitPracticeAnswer({
        sessionId,
        lessonItemId: getPersistedLessonItemId(item?.id),
        answerText: drawingSnapshot,
        isCorrect: feedback.isCorrect,
        metadata: {
          writing_feedback_title: feedback.title,
          writing_feedback_message: feedback.message,
        },
      });

      if ("error" in answer) {
        setError(answer.error);
        return;
      }

      setFeedbackByItem((current) => ({
        ...current,
        [currentItemKey]: feedback,
      }));
      if (canAdvanceWritingQuestion(feedback, difficulty)) {
        setSubmittedItems((current) => new Set(current).add(currentItemKey));
        setCompletedCount((current) => Math.max(current, currentIndex + 1));
      }
    });
  }

  function next() {
    if (currentIndex + 1 >= items.length) {
      finish();
      return;
    }

    setCurrentIndex((index) => index + 1);
    setHasDrawing(false);
    setDrawingSnapshot("[]");
    setRetryAttempt(0);
  }

  function retryCurrent() {
    setHasDrawing(false);
    setDrawingSnapshot("[]");
    setFeedbackByItem((current) => {
      const nextFeedback = { ...current };
      delete nextFeedback[currentItemKey];
      return nextFeedback;
    });
    setRetryAttempt((attempt) => attempt + 1);
  }

  function finish() {
    if (!sessionId) return;

    startTransition(async () => {
      const response = await completePracticeSession({
        sessionId,
        baseXp: items.length * 20,
        multiplier: config.xpMultiplier,
        endingHealth: config.startingHealth,
      });

      if ("error" in response) {
        setError(response.error);
        return;
      }

      setResult(`Writing practice complete. You earned ${response.earnedXp} XP.`);
    });
  }

  if (result) {
    return (
      <div className="rounded-[20px] border border-[#e7d7c3] bg-[#fbf6f1] p-5 text-center">
        <CheckCircle2 className="mx-auto size-10 text-emerald-600" />
        <h2 className="mt-3 font-cinzel text-2xl font-bold text-[#7c571e]">
          Session complete
        </h2>
        <p className="mt-1 text-lg text-[#4f4539]">{result}</p>
      </div>
    );
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="space-y-6">
      {!sessionId && (
        <ProgressHeader
          progress={nextProgressValue(completedCount, items.length)}
          config={config}
          health={config.startingHealth}
          remainingSeconds={remainingSeconds}
        />
      )}

      {!sessionId ? (
        <PracticeConfirmation
          title="Writing drill"
          description="Draw the Greek letter or phrase on the canvas. Use a mouse, touch, or stylus."
          config={config}
          mode="writing"
          questionCount={items.length}
          error={error}
          isPending={isPending}
          onStart={beginSession}
        />
      ) : (
        <div className="mx-auto w-full space-y-6">
          {/* Header Row */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <Link
                href={`/learn?difficulty=${difficulty}`}
                className="flex size-11 items-center justify-center rounded-full border border-[#e7d7c3] bg-white text-[#7c571e] shadow-sm transition-colors hover:bg-[#fbf6f1]"
              >
                <ChevronLeft className="size-6" />
              </Link>
              <div className="text-center">
                <h1 className="text-2xl font-bold text-black">Writing Practice</h1>
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

          <div className="space-y-5">
            <div>
              <p className="text-base font-bold uppercase tracking-wide text-[#c89b5b]">
                Question {currentIndex + 1} of {items.length}
              </p>
              <h2 className="mt-2 font-cinzel text-[31px] font-bold leading-tight text-[#7c571e]">
                {item?.prompt ?? "Write the Greek prompt."}
              </h2>
              {item?.greek ? (
                <p className="mt-3 inline-flex items-center gap-2 font-cinzel text-3xl font-bold text-[#1d1c16]">
                  <PenTool className="size-5" />
                  {item.greek}
                </p>
              ) : null}
              {writingOutline ? (
                <p className="mt-3 rounded-[14px] border border-[#e7d7c3] bg-[#fbf6f1] px-4 py-3 text-lg font-semibold text-[#4f4539]">
                  Outline: {writingOutline.instruction}
                </p>
              ) : null}
            </div>

            <DrawingCanvas
              key={`${currentItemKey}-${retryAttempt}`}
              guideText={writingOutline?.target}
              onChange={setHasDrawing}
              onSnapshotChange={setDrawingSnapshot}
            />

            <Button
              type="button"
              className="h-14 w-full rounded-full bg-[#c89b5b] text-lg font-bold text-[#f6f1e8] hover:bg-[#b88945]"
              onClick={submitCurrent}
              disabled={!hasDrawing || isPending || canAdvanceCurrentItem}
            >
              Save answer
            </Button>

            {currentFeedback ? (
              <div className="grid gap-3 rounded-[18px] border border-[#e7d7c3] bg-[#fbf6f1] p-3 md:grid-cols-[1fr_auto] md:items-center">
                <div>
                  <p
                    className={`text-lg font-bold ${
                      currentFeedback?.isCorrect
                        ? "text-emerald-700"
                        : "text-[#9a6d28]"
                    }`}
                  >
                    Writing Feedback: {currentFeedback?.title ?? "Answer saved"}
                  </p>
                  {currentFeedback ? (
                    <p className="mt-1 text-base text-[#4f4539]">
                      {currentFeedback.message}
                    </p>
                  ) : null}
                </div>
                {canAdvanceCurrentItem ? (
                  <Button
                    type="button"
                    onClick={next}
                    disabled={isPending || !hasSubmittedCurrentItem}
                    className="h-12 rounded-full bg-[#c89b5b] px-7 text-base font-bold text-[#f6f1e8] hover:bg-[#b88945]"
                  >
                    {currentIndex + 1 >= items.length ? "Finish" : "Next"}
                    <ArrowRight className="size-5" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    onClick={retryCurrent}
                    disabled={isPending}
                    className="h-12 rounded-full bg-[#c89b5b] px-7 text-base font-bold text-[#f6f1e8] hover:bg-[#b88945]"
                  >
                    Try again
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error ? <p className="text-lg text-destructive">{error}</p> : null}
    </div>
  );
}
