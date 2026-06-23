"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { ArrowRight, Mic, Play, Square, Trash2, ChevronLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Difficulty, DifficultyConfig } from "@/features/difficulty/rules";
import { PracticeConfirmation } from "@/features/practice/practice-confirmation";
import { ProgressHeader } from "@/features/practice/progress-header";
import { nextProgressValue } from "@/features/practice/progress";
import { useSessionShell } from "@/features/practice/session-shell";
import { createAudioRecorder } from "@/lib/audio/recorder";
import {
  completePracticeSession,
  failPracticeSession,
  startPracticeSession,
  submitPracticeAnswer,
  uploadPracticeRecording,
} from "@/server/actions/practice";
import type { PracticeItem } from "@/server/queries/practice";

type RecorderHandle = Awaited<ReturnType<typeof createAudioRecorder>>;

type Props = {
  lessonId: string;
  difficulty: Difficulty;
  config: DifficultyConfig;
  items: PracticeItem[];
  autoStart?: boolean;
};

export function SpeakingPractice({
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

  const [recorder, setRecorder] = useState<RecorderHandle | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingStartedAt, setRecordingStartedAt] = useState<number | null>(
    null,
  );
  const [durationSeconds, setDurationSeconds] = useState<number | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [recordedItems, setRecordedItems] = useState<Set<string>>(() => new Set());
  const [remainingSeconds, setRemainingSeconds] = useState(
    config.timeLimitSeconds,
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const autoStartRequestedRef = useRef(false);
  const item = items[currentIndex];
  const currentItemKey = item?.id ?? String(currentIndex);
  const hasRecordingForCurrentItem = recordedItems.has(currentItemKey);

  const failSession = useCallback(async () => {
    if (!sessionId) return;

    if (recorder) {
      await recorder.stop();
      setRecorder(null);
    }

    const response = await failPracticeSession({
      sessionId,
      endingHealth: config.startingHealth,
    });

    if ("error" in response) {
      setError(response.error);
      return;
    }

    setResult("Time is up. Try this speaking practice again to earn XP.");
  }, [config.startingHealth, recorder, sessionId]);

  useEffect(() => {
    if (!sessionId || result || !config.timeLimitSeconds) return;

    const timer = window.setInterval(() => {
      setRemainingSeconds((current) => {
        if (current === null || current <= 1) {
          window.clearInterval(timer);
          startTransition(() => {
            void failSession();
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
        mode: "speaking",
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

  async function startRecording() {
    setError(null);

    try {
      const nextRecorder = await createAudioRecorder();
      nextRecorder.recorder.start();
      setRecorder(nextRecorder);
      setRecordingStartedAt(Date.now());
    } catch (recordingError) {
      setError(
        recordingError instanceof Error
          ? recordingError.message
          : "Could not start recording.",
      );
    }
  }

  async function stopRecording() {
    if (!recorder) return;
    const blob = await recorder.stop();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(blob);
    setAudioUrl(URL.createObjectURL(blob));
    setDurationSeconds(
      recordingStartedAt
        ? Math.max(1, Math.round((Date.now() - recordingStartedAt) / 1000))
        : null,
    );
    setRecorder(null);
    setRecordingStartedAt(null);
  }

  function clearRecording() {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setDurationSeconds(null);
  }

  function finish() {
    if (!sessionId || !audioBlob) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.append("sessionId", sessionId);
      formData.append(
        "recording",
        audioBlob,
        `speaking-${sessionId}.${getAudioExtension(audioBlob.type)}`,
      );
      if (durationSeconds) {
        formData.append("durationSeconds", String(durationSeconds));
      }

      const upload = await uploadPracticeRecording(formData);

      if ("error" in upload) {
        setError(upload.error);
        return;
      }

      const answer = await submitPracticeAnswer({
        sessionId,
        lessonItemId: item?.id,
        answerText: upload.storagePath,
        isCorrect: true,
        timeSpentSeconds: durationSeconds ?? undefined,
        metadata: {
          mode: "speaking",
          storagePath: upload.storagePath,
          mimeType: audioBlob.type || "audio/webm",
        },
      });

      if ("error" in answer) {
        setError(answer.error);
        return;
      }

      setRecordedItems((current) => new Set(current).add(currentItemKey));
      setCompletedCount((current) => Math.max(current, currentIndex + 1));
      clearRecording();
    });
  }

  function next() {
    if (currentIndex + 1 >= items.length) {
      completeSession();
      return;
    }

    setCurrentIndex((index) => index + 1);
    clearRecording();
  }

  function completeSession() {
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

      setResult(`Speaking practice complete. You earned ${response.earnedXp} XP.`);
    });
  }

  if (result) {
    return (
      <div className="rounded-[20px] border border-[#e7d7c3] bg-[#fbf6f1] p-5 text-center">
        <h2 className="font-cinzel text-2xl font-bold text-[#7c571e]">
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
          title="Speaking drill"
          description="Record yourself speaking the prompt, then review your audio before finishing."
          config={config}
          mode="speaking"
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
                <h1 className="text-2xl font-bold text-black">Speaking Practice</h1>
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
                {item?.prompt ?? "Say the phrase aloud."}
              </h2>
              {item?.greek ? (
                <p className="mt-3 font-cinzel text-3xl font-bold text-[#1d1c16]">
                  {item.greek}
                </p>
              ) : null}
            </div>

            <div className="rounded-[20px] border border-[#e7d7c3] bg-[#fbf6f1] p-5">
              <div className="flex flex-wrap gap-2">
                {!recorder ? (
                  <Button
                    type="button"
                    className="h-12 rounded-full bg-[#c89b5b] px-5 text-base font-bold text-[#f6f1e8] hover:bg-[#b88945]"
                    onClick={startRecording}
                  >
                    <Mic className="size-5" />
                    Record
                  </Button>
                ) : (
                  <Button type="button" variant="destructive" onClick={stopRecording}>
                    <Square className="size-4" />
                    Stop
                  </Button>
                )}
                {audioUrl ? (
                  <Button
                    type="button"
                    variant="outline"
                    className="rounded-[14px] border-[#7c571e]/30 bg-white text-[#4f4539]"
                    onClick={clearRecording}
                  >
                    <Trash2 className="size-4" />
                    Clear
                  </Button>
                ) : null}
              </div>

              {audioUrl ? (
                <audio controls src={audioUrl} className="mt-4 w-full">
                  <track kind="captions" />
                </audio>
              ) : (
                <p className="mt-4 text-lg text-[#817568]">
                  Your recording preview will appear here.
                </p>
              )}
            </div>

            <Button
              type="button"
              className="h-14 w-full rounded-full bg-[#c89b5b] text-lg font-bold text-[#f6f1e8] hover:bg-[#b88945]"
              onClick={finish}
              disabled={!audioBlob || isPending || hasRecordingForCurrentItem}
            >
              <Play className="size-5" />
              Save recording
            </Button>

            {hasRecordingForCurrentItem ? (
              <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#e7d7c3] bg-[#fbf6f1] p-3">
                <p className="text-lg font-bold text-[#4f4539]">
                  Recording saved
                </p>
                <Button
                  type="button"
                  onClick={next}
                  disabled={isPending}
                  className="h-12 rounded-full bg-[#c89b5b] px-7 text-base font-bold text-[#f6f1e8] hover:bg-[#b88945]"
                >
                  {currentIndex + 1 >= items.length ? "Finish" : "Next"}
                  <ArrowRight className="size-5" />
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {error ? <p className="text-lg text-destructive">{error}</p> : null}
    </div>
  );
}

function getAudioExtension(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("mpeg")) return "mp3";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}
