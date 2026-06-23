"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import { ArrowLeft, Mic, Send, Square, Volume2, ChevronLeft } from "lucide-react";
import Link from "next/link";

import type { Difficulty, DifficultyConfig } from "@/features/difficulty/rules";
import { PracticeConfirmation } from "@/features/practice/practice-confirmation";
import { useSessionShell } from "@/features/practice/session-shell";
import { ProgressHeader } from "@/features/practice/progress-header";
import { nextProgressValue } from "@/features/practice/progress";
import { ConversationResult } from "@/features/conversation/conversation-result";
import type { ConversationReply } from "@/lib/ai/conversation-replier";
import type { ConversationScore } from "@/lib/ai/conversation-scorer";
import {
  createGreekSpeechRecognizer,
  type GreekSpeechRecognizer,
  isSpeechRecognitionSupported,
} from "@/lib/audio/speech-recognition";
import { speakGreek } from "@/lib/audio/tts";
import {
  completePracticeSession,
  failPracticeSession,
  startPracticeSession,
  submitPracticeAnswer,
} from "@/server/actions/practice";
import type { PracticeItem } from "@/server/queries/practice";

type ChatMessage = {
  id: number;
  role: "assistant" | "user";
  text: string;
  englishHint?: string;
};

type Props = {
  lessonId: string;
  difficulty: Difficulty;
  config: DifficultyConfig;
  items: PracticeItem[];
  autoStart?: boolean;
};

export function ConversationPractice({
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

  const [currentInput, setCurrentInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [score, setScore] = useState<ConversationScore | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(
    config.timeLimitSeconds,
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [voiceSupported] = useState(isSpeechRecognitionSupported);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognizerRef = useRef<GreekSpeechRecognizer | null>(null);
  const autoStartRequestedRef = useRef(false);
  const item = items[0];
  const scenarioGoals = useMemo(() => item?.scenario_goals ?? [], [item]);
  const openingLine = "Καλημέρα! Τι θα πάρετε;";
  const followUpLine = "Βεβαίως. Ελληνικό ή φραπέ;";
  const openingHint = "Good morning! What would you like?";
  const followUpHint = "Of course. Greek coffee or frappe?";
  const openingMessages = useMemo<ChatMessage[]>(
    () => [
      { id: 1, role: "assistant", text: openingLine, englishHint: openingHint },
      { id: 2, role: "assistant", text: followUpLine, englishHint: followUpHint },
    ],
    [followUpHint, followUpLine, openingHint, openingLine],
  );

  const fullTranscript = [...openingMessages, ...messages]
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    return () => {
      recognizerRef.current?.stop();
    };
  }, []);

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

    setFailedMessage("Time is up. Try this conversation again to earn XP.");
  }, [config.startingHealth, sessionId]);

  useEffect(() => {
    if (!sessionId || score || failedMessage || !config.timeLimitSeconds) return;

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
  }, [
    config.timeLimitSeconds,
    failSession,
    failedMessage,
    score,
    sessionId,
  ]);

  const beginSession = useCallback(() => {
    setError(null);
    startTransition(async () => {
      const response = await startPracticeSession({
        lessonId,
        mode: "conversation",
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

  async function requestAssistantReply(nextMessages: ChatMessage[]) {
    if (!sessionId) return;

    setIsReplying(true);

    try {
      const response = await fetch("/api/conversation-reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          messages: [...openingMessages, ...nextMessages].map((message) => ({
            role: message.role,
            text: message.text,
          })),
        }),
      });
      const payload = (await response.json()) as
        | ConversationReply
        | { error: string };

      if (!response.ok || "error" in payload) {
        setError("error" in payload ? payload.error : "Could not get a reply.");
        return;
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: payload.text,
          englishHint: payload.englishHint,
        },
      ]);
    } catch {
      setError("Could not get a reply. Please try again.");
    } finally {
      setIsReplying(false);
    }
  }

  function sendMessage() {
    const text = currentInput.trim();
    if (!text || !sessionId || isPending || isReplying) return;

    setError(null);

    const nextMessages = [
      ...messages,
      { id: Date.now(), role: "user" as const, text },
    ];
    setMessages(nextMessages);
    setCurrentInput("");
    void requestAssistantReply(nextMessages);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function startVoiceInput() {
    if (!sessionId || isPending || isReplying) return;
    setError(null);

    try {
      const recognizer = createGreekSpeechRecognizer();
      recognizerRef.current = recognizer;
      setIsListening(true);

      recognizer.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0]?.transcript ?? "")
          .join(" ")
          .trim();

        if (!transcript) return;

        setCurrentInput((current) => {
          const separator = current.trim().length > 0 ? " " : "";
          return `${current}${separator}${transcript}`;
        });
      };

      recognizer.onerror = () => {
        setError("Could not understand your voice. Please try again.");
      };

      recognizer.onend = () => {
        setIsListening(false);
        recognizerRef.current = null;
        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      };

      recognizer.start();
    } catch (voiceError) {
      setIsListening(false);
      setError(
        voiceError instanceof Error
          ? voiceError.message
          : "Could not start voice input.",
      );
    }
  }

  function stopVoiceInput() {
    recognizerRef.current?.stop();
    setIsListening(false);
  }

  /** End the conversation and score the full transcript */
  function finish() {
    if (!sessionId) return;
    setError(null);
    setShowEndConfirm(false);

    const pendingText = currentInput.trim();
    const allMessages = pendingText
      ? [
        ...openingMessages,
        ...messages,
        { id: Date.now(), role: "user" as const, text: pendingText },
      ]
      : [...openingMessages, ...messages];

    const transcript = allMessages
      .map((message) => `${message.role}: ${message.text}`)
      .join("\n");

    startTransition(async () => {
      const answer = await submitPracticeAnswer({
        sessionId,
        lessonItemId: item?.id,
        answerText: transcript,
      });

      if ("error" in answer) {
        setError(answer.error);
        return;
      }

      const completed = await completePracticeSession({
        sessionId,
        baseXp: 35,
        multiplier: config.xpMultiplier,
        endingHealth: config.startingHealth,
      });

      if ("error" in completed) {
        setError(completed.error);
        return;
      }

      const response = await fetch("/api/conversation-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const payload = (await response.json()) as
        | ConversationScore
        | { error: string };

      if (!response.ok || "error" in payload) {
        setError("error" in payload ? payload.error : "Could not score session.");
        return;
      }

      setScore(payload);
    });
  }

  function insertGreek(value: string) {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCurrentInput((current) => current + value);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const next = `${currentInput.slice(0, start)}${value}${currentInput.slice(end)}`;
    setCurrentInput(next);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = start + value.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  }

  function backspaceGreek() {
    const textarea = textareaRef.current;
    if (!textarea) {
      setCurrentInput((current) => current.slice(0, -1));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === 0 && end === 0) return;

    const deleteFrom = start === end ? Math.max(0, start - 1) : start;
    const next = `${currentInput.slice(0, deleteFrom)}${currentInput.slice(end)}`;
    setCurrentInput(next);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(deleteFrom, deleteFrom);
    });
  }

  if (score) {
    return <ConversationResult score={score} />;
  }

  if (failedMessage) {
    return (
      <div className="mx-auto max-w-[720px] rounded-[20px] border border-[#e7d7c3] bg-[#fbf6f1] p-6 text-center">
        <h2 className="font-cinzel text-2xl font-bold text-[#7c571e]">
          Conversation ended
        </h2>
        <p className="mt-2 text-lg text-[#4f4539]">{failedMessage}</p>
      </div>
    );
  }

  if (!sessionId) {
    return (
      <div className="mx-auto mt-4 max-w-[760px]">
        <div className="mx-auto max-w-[680px]">
          <PracticeConfirmation
            title="Confirm Conversation"
            description={
              item?.prompt ?? "Start this conversation scenario when you are ready."
            }
            config={config}
            mode="conversation"
            questionCount={1}
            error={error}
            isPending={isPending}
            onStart={beginSession}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-practice-container relative mx-auto mt-2 w-full max-w-none xl:max-w-[1200px] px-2 sm:px-0">
      <style dangerouslySetInnerHTML={{
        __html: `
        /* =====================================================
           Viewport lock — mobile & tablet ONLY (< 1280px)
           On laptop the sidebar + header stay visible.
        ===================================================== */
        @media (max-width: 1279px) {
          html, body {
            overflow: hidden !important;
            height: 100vh !important;
            min-height: 0 !important;
            max-height: 100vh !important;
          }
          main {
            height: 100vh !important;
            min-height: 0 !important;
            max-height: 100vh !important;
            overflow: hidden !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
          }
          header {
            display: none !important;
          }
        }

        /* Mobile: clear bottom nav (height ~62px + bottom-3 = ~74px) */
        @media (max-width: 767px) {
          main {
            padding-bottom: 76px !important;
          }
          .conversation-section {
            flex: 1 1 0% !important;
            min-height: 0 !important;
            max-height: calc(100vh - 76px) !important;
            height: calc(100vh - 76px) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            padding-top: 12px !important;
            padding-bottom: 0px !important;
            padding-left: 8px !important;
            padding-right: 8px !important;
            box-sizing: border-box !important;
          }
        }

        /* Tablet: clear bottom nav (height ~96px + bottom-6 = ~120px) */
        @media (min-width: 768px) and (max-width: 1279px) {
          main {
            padding-bottom: 76px !important;
          }
          .conversation-section {
            flex: 1 1 0% !important;
            min-height: 0 !important;
            max-height: calc(100vh - 76px) !important;
            height: calc(100vh - 76px) !important;
            display: flex !important;
            flex-direction: column !important;
            overflow: hidden !important;
            padding-top: 16px !important;
            padding-bottom: 0px !important;
            padding-left: 16px !important;
            padding-right: 16px !important;
            box-sizing: border-box !important;
          }
        }

        /* Flex-fill helpers for mobile & tablet only */
        @media (max-width: 1279px) {
          .conversation-practice-container {
            flex: 1 1 0% !important;
            min-height: 0 !important;
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
            width: 100% !important;
            margin-top: 8px !important;
          }
          .practice-main-card {
            display: flex !important;
            flex-direction: column !important;
            flex: 0 1 auto !important;
            min-height: auto !important;
            width: 100% !important;
            max-width: 760px !important;
            margin-top: 8px !important;
          }
          .practice-chat-area {
            flex: 0 1 auto !important;
            min-height: 220px !important;
            max-height: calc(100vh - 520px) !important;
            height: auto !important;
            overflow-y: auto !important;
          }
        }

        /* Scrollbar styles (all sizes) */
        .practice-chat-area::-webkit-scrollbar {
          width: 6px;
        }
        .practice-chat-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .practice-chat-area::-webkit-scrollbar-thumb {
          background: #e7d7c3;
          border-radius: 3px;
        }
        .practice-chat-area::-webkit-scrollbar-thumb:hover {
          background: #bd862c;
        }
      `}} />

      {/* Mobile/Tablet Fixed Header Section */}
      <div className="xl:hidden fixed top-0 left-0 right-0 bg-[#fbf6f1] z-30 px-4 pt-3 pb-2 flex flex-col items-center border-b border-[#e9ddcf]/40 shadow-sm">
        {/* Header Row: Back, Title, End — visible on mobile/tablet only */}
        <div className="flex items-center justify-between mb-2 mt-1 w-full">
          <Link
            href={`/learn?difficulty=${difficulty}`}
            className="flex size-11 items-center justify-center rounded-full border border-[#ece8df] bg-white text-[#bd862c] shadow-sm transition-colors hover:bg-[#fbf6f1]"
            aria-label="Go back"
          >
            <ChevronLeft className="size-6" />
          </Link>

          <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-black text-center">
            Conversation Practice
          </h1>

          <button
            type="button"
            id="end-conversation-btn"
            onClick={() => setShowEndConfirm(true)}
            disabled={isPending || isReplying}
            className="flex shrink-0 items-center justify-center rounded-[10px] bg-red-50 hover:bg-red-100 px-4 py-2 text-base font-bold text-red-500 shadow-sm transition-colors disabled:opacity-50"
            aria-label="End conversation and get scored"
          >
            End
          </button>
        </div>

        {/* Scenario card — mobile/tablet only */}
        <div className="relative w-full bg-[#fdfaf6] border border-[#e9ddcf] rounded-[24px] py-3 pr-4 pl-[88px] sm:pl-[104px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="absolute left-[-16px] sm:left-[-24px] top-1/2 -translate-y-1/2 w-[80px] h-[80px] sm:w-[100px] sm:h-[100px] rounded-full border border-[#bd862c] overflow-hidden bg-white shadow-md">
            <Image
              src="/figma/conversation/waiter.png"
              alt="Waiter"
              fill
              sizes="(max-width: 640px) 80px, 100px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
            <h2 className="font-cinzel text-base sm:text-lg font-bold tracking-wide text-[#bd862c] uppercase">
              GREET THE WAITERS AT THE CAFE
            </h2>
            <p className="mt-0.5 text-xs sm:text-sm font-semibold text-black">
              Χαιρετισμός στους σερβιτόρους στο καφέ
            </p>
            <p className="mt-1 text-[10px] text-[#817568] italic font-medium">
              *You may continue the chat until an unlimited amount of time
            </p>
          </div>
        </div>
      </div>

      {/* Spacer for Mobile/Tablet Fixed Header */}
      <div className="xl:hidden h-[162px] sm:h-[186px] w-full shrink-0" />

      {/* Laptop-only Header Section */}
      <div className="hidden xl:grid grid-cols-[114px_1fr_114px] items-center gap-4 mt-2 mb-4 w-full">
        {/* Back button */}
        <div className="flex justify-start">
          <Link
            href={`/learn?difficulty=${difficulty}`}
            className="inline-flex h-[53px] w-[114px] items-center justify-center gap-2 rounded-[14px] border border-[#7c571e]/30 bg-white text-base font-semibold text-black shadow-[0_4px_8px_rgba(0,0,0,0.16)] transition-colors hover:bg-[#fbf6f1]"
            aria-label="Go back"
          >
            <ArrowLeft className="size-4" />
            Back
          </Link>
        </div>

        {/* Scenario card — centered and matches chat card width */}
        <div className="mx-auto w-full max-w-[760px] relative bg-[#fdfaf6] border border-[#e9ddcf] rounded-[24px] py-3 pr-4 pl-[116px] shadow-[0_4px_16px_rgba(0,0,0,0.06)]">
          <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-[100px] h-[100px] rounded-full border border-[#bd862c] overflow-hidden bg-white shadow-md">
            <Image
              src="/figma/conversation/waiter.png"
              alt="Waiter"
              fill
              sizes="100px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col items-start text-left">
            <h2 className="font-cinzel text-lg font-bold tracking-wide text-[#bd862c] uppercase">
              GREET THE WAITERS AT THE CAFE
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-black">
              Χαιρετισμός στους σερβιτόρους στο καφέ
            </p>
            <p className="mt-1 text-[10px] text-[#817568] italic font-medium">
              *You may continue the chat until an unlimited amount of time
            </p>
          </div>
        </div>

        {/* End button */}
        <div className="flex justify-end">
          <button
            type="button"
            id="end-conversation-btn-desktop"
            onClick={() => setShowEndConfirm(true)}
            disabled={isPending || isReplying}
            className="flex h-[53px] w-[114px] shrink-0 items-center justify-center rounded-[14px] border border-red-200/60 bg-red-50 hover:bg-red-100 text-base font-bold text-red-500 shadow-[0_4px_8px_rgba(0,0,0,0.08)] transition-colors disabled:opacity-50"
            aria-label="End conversation and get scored"
          >
            End
          </button>
        </div>
      </div>
      {/* End confirmation inline banner */}
      {showEndConfirm && (
        <div className="mx-auto mt-2 flex w-full max-w-[760px] items-center justify-between gap-4 rounded-[14px] border border-amber-200 bg-amber-50 px-5 py-3 shadow-sm">
          <p className="text-base font-medium text-amber-800">
            End the conversation now? The AI will score everything you&apos;ve typed.
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => setShowEndConfirm(false)}
              className="rounded-[8px] border border-amber-300 bg-white px-3 py-1.5 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={finish}
              disabled={
                isPending ||
                isReplying ||
                (!currentInput.trim() &&
                  !messages.some((message) => message.role === "user"))
              }
              className="rounded-[8px] bg-red-500 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
            >
              {isPending ? "Scoring…" : "Yes, End & Score"}
            </button>
          </div>
        </div>
      )}

      <div className="practice-main-card mx-auto mt-3 w-full max-w-[760px] rounded-[24px] sm:rounded-[36px] md:rounded-[42px] bg-[#fffcfa] px-0 pb-0 pt-3 sm:pt-4 shadow-[0_0_34px_rgba(255,255,255,0.85)] flex flex-col overflow-hidden">
        {/* Chat area */}
        <div className="practice-chat-area relative h-[420px] sm:h-[400px] md:h-[280px] xl:h-auto xl:min-h-[340px] overflow-y-auto rounded-t-[20px] sm:rounded-t-[32px] md:rounded-t-[42px] bg-[#fffcfa] px-3 py-4 md:px-4 md:py-5 flex flex-col">
          <div className="absolute left-0 top-0 size-full bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.72)_48%,rgba(255,252,250,0.92)_100%)] pointer-events-none" />

          <div className="relative flex flex-col gap-4 flex-1">
            {/* Static AI opening lines */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-start items-end gap-2 max-w-[92%] md:max-w-[88%]">
                <div className="flex items-center gap-3 bg-white border border-[#ece8df] rounded-[24px] rounded-bl-[4px] px-5 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <SoundButton text={openingLine} onError={setError} className="size-10 sm:size-11" />
                  <div>
                    <p className="text-lg sm:text-[20px] text-[#1d1c16] leading-relaxed">{openingLine}</p>
                    <p className="mt-1 text-sm sm:text-base font-semibold text-[#817568]">
                      {openingHint}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-start items-end gap-2 max-w-[92%] md:max-w-[88%]">
                <div className="flex items-center gap-3 bg-white border border-[#ece8df] rounded-[24px] rounded-bl-[4px] px-5 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                  <SoundButton text={followUpLine} onError={setError} className="size-10 sm:size-11" />
                  <div>
                    <p className="text-lg sm:text-[20px] text-[#1d1c16] leading-relaxed">{followUpLine}</p>
                    <p className="mt-1 text-sm sm:text-base font-semibold text-[#817568]">
                      {followUpHint}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live messages */}
            {messages.map((msg) => {
              if (msg.role === "user") {
                return (
                  <div key={msg.id} className="flex justify-end items-end gap-2 max-w-[92%] md:max-w-[88%] ml-auto">
                    <div className="flex items-center gap-3 bg-[#bd862c] text-white rounded-[24px] rounded-br-[4px] px-5 py-3.5 shadow-[0_4px_12px_rgba(189,134,44,0.15)]">
                      <SoundButton text={msg.text} onError={setError} className="size-10 sm:size-11" />
                      <p className="text-lg sm:text-[20px] text-white leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div key={msg.id} className="flex justify-start items-end gap-2 max-w-[92%] md:max-w-[88%]">
                    <div className="flex items-center gap-3 bg-white border border-[#ece8df] rounded-[24px] rounded-bl-[4px] px-5 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
                      <SoundButton text={msg.text} onError={setError} className="size-10 sm:size-11" />
                      <div>
                        <p className="text-lg sm:text-[20px] text-[#1d1c16] leading-relaxed">{msg.text}</p>
                        {msg.englishHint && (
                          <p className="mt-1 text-sm sm:text-base font-semibold text-[#817568]">
                            {msg.englishHint}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }
            })}

            {isReplying ? (
              <div className="flex justify-start items-end gap-2 max-w-[92%] md:max-w-[88%]">
                <div className="bg-white border border-[#ece8df] rounded-[24px] rounded-bl-[4px] px-5 py-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.05)] text-lg sm:text-[20px] text-[#817568] italic">
                  Thinking...
                </div>
              </div>
            ) : null}

            {messages.length === 0 && (
              <div className="flex justify-end ml-auto w-full">
                <div className="w-fit max-w-[80%] md:max-w-[70%] rounded-[18px] border border-[#9cc5fb]/30 bg-[#cfe2ff]/20 px-5 py-4 text-base sm:text-lg italic text-[#334155]/60">
                  Your Greek responses will appear here…
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-[#ece8df] bg-[#fdfaf7] px-4 py-2 sm:px-6">
          <div className="relative rounded-[28px] border border-[#e7d7c3] bg-white px-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={isListening ? stopVoiceInput : startVoiceInput}
                className={`flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50 ${isListening ? "bg-red-500 animate-pulse" : "bg-[#7c571e]"
                  }`}
                aria-label={
                  isListening ? "Stop voice input" : "Start voice input"
                }
                disabled={!sessionId || isPending || isReplying || !voiceSupported}
              >
                {isListening ? (
                  <Square className="size-5 sm:size-6 fill-white" />
                ) : (
                  <Mic className="size-5 sm:size-6 text-white" />
                )}
              </button>

              <textarea
                ref={textareaRef}
                value={currentInput}
                onChange={(event) => {
                  setCurrentInput(event.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                className="flex-1 min-h-[44px] max-h-[120px] resize-none bg-transparent py-2 text-lg sm:text-[20px] leading-relaxed text-[#1d1c16] outline-none placeholder:text-[#817568]"
                placeholder="Type your response in Greek…"
                disabled={!sessionId || isPending || isReplying}
                rows={1}
              />

              <button
                type="button"
                id="send-message-btn"
                onClick={sendMessage}
                disabled={
                  !sessionId || !currentInput.trim() || isPending || isReplying
                }
                className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-full bg-[#bd862c] text-white shadow-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="size-5 sm:size-6 text-white" />
              </button>
            </div>
          </div>
          <p className="mt-1 text-center text-[11px] sm:text-xs font-semibold text-[#817568]">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
        <GreekKeyboard
          disabled={!sessionId || isPending || isReplying}
          onKey={insertGreek}
          onBackspace={backspaceGreek}
          onEnter={sendMessage}
        />
      </div>

      <div className="sr-only">
        <ProgressHeader
          progress={nextProgressValue(fullTranscript.trim() ? 1 : 0, 1)}
          config={config}
          health={config.startingHealth}
          remainingSeconds={remainingSeconds}
        />
        {scenarioGoals.join(", ")}
        <Volume2 />
      </div>

      {error ? <p className="text-lg text-destructive mt-2 text-center">{error}</p> : null}
    </div>
  );
}

function SoundButton({
  text,
  className,
  onError,
}: {
  text: string;
  className?: string;
  onError: (message: string) => void;
}) {
  async function play() {
    const result = await speakGreek(text);
    if (!result.ok) onError(result.error);
  }

  return (
    <button
      type="button"
      onClick={play}
      className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-[#ece8df] bg-white text-[#bd862c] shadow-[0_2px_6px_rgba(0,0,0,0.08)] transition-all hover:scale-105 active:scale-95 ${className ?? ""}`}
      aria-label="Play audio"
    >
      <Volume2 className="size-5 text-[#bd862c]" />
    </button>
  );
}

function GreekKeyboard({
  disabled,
  onKey,
  onBackspace,
  onEnter,
}: {
  disabled: boolean;
  onKey: (value: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
}) {
  const [isShifted, setIsShifted] = useState(false);
  const [isCaps, setIsCaps] = useState(false);
  const [tonosActive, setTonosActive] = useState(false);

  const row1 = [
    { value: "`", display: "`" },
    { value: "1", display: "1" },
    { value: "2", display: "2" },
    { value: "3", display: "3" },
    { value: "4", display: "4" },
    { value: "5", display: "5" },
    { value: "6", display: "6" },
    { value: "7", display: "7" },
    { value: "8", display: "8" },
    { value: "9", display: "9" },
    { value: "0", display: "0" },
    { value: "~", display: "~", isHighlighted: true },
    { value: "'", display: "'", isHighlighted: true },
    { value: "backspace", display: "⌫", isSpecial: true },
  ];

  const row2 = [
    { value: "tab", display: "⇥", isSpecial: true },
    { value: ";", display: ";" },
    { value: "ς", display: "ς" },
    { value: "ε", display: "ε" },
    { value: "ρ", display: "ρ" },
    { value: "τ", display: "τ" },
    { value: "υ", display: "υ" },
    { value: "θ", display: "θ" },
    { value: "ι", display: "ι" },
    { value: "ο", display: "ο" },
    { value: "π", display: "π" },
    { value: "[", display: "[", isHighlighted: true },
    { value: "]", display: "]", isHighlighted: true },
    { value: "\\", display: "\\" },
  ];

  const row3 = [
    { value: "caps", display: "⇪", isSpecial: true },
    { value: "α", display: "α" },
    { value: "σ", display: "σ" },
    { value: "δ", display: "δ" },
    { value: "φ", display: "φ" },
    { value: "γ", display: "γ" },
    { value: "η", display: "η" },
    { value: "ξ", display: "ξ" },
    { value: "κ", display: "κ" },
    { value: "λ", display: "λ" },
    { value: "tonos", display: "´", isHighlighted: true },
    { value: "'", display: "'", isHighlighted: true },
    { value: "enter", display: "↵", isSpecial: true, isEnter: true },
  ];

  const row4 = [
    { value: "shift", display: "⇧", isSpecial: true },
    { value: "ζ", display: "ζ" },
    { value: "χ", display: "χ" },
    { value: "ψ", display: "ψ" },
    { value: "ω", display: "ω" },
    { value: "β", display: "β" },
    { value: "ν", display: "ν" },
    { value: "μ", display: "μ" },
    { value: ",", display: "," },
    { value: ".", display: "." },
    { value: "/", display: "/", isHighlighted: true },
    { value: "shift", display: "⇧", isSpecial: true },
  ];

  const handleKeyClick = (keyVal: string) => {
    if (keyVal === "backspace") {
      onBackspace();
    } else if (keyVal === "enter") {
      onEnter();
    } else if (keyVal === "tab") {
      onKey(" ");
    } else if (keyVal === "caps") {
      setIsCaps((prev) => !prev);
    } else if (keyVal === "shift") {
      setIsShifted((prev) => !prev);
    } else if (keyVal === "tonos") {
      setTonosActive((prev) => !prev);
    } else {
      let char = keyVal;
      if (isShifted || isCaps) {
        char = char.toUpperCase();
      }
      if (tonosActive) {
        char = mapVowelWithTonos(char);
        setTonosActive(false);
      }
      onKey(char);
      if (isShifted) {
        setIsShifted(false);
      }
    }
  };

  const mapVowelWithTonos = (char: string): string => {
    const lower = char.toLowerCase();
    const vowelMap: Record<string, string> = {
      α: "ά",
      ε: "έ",
      η: "ή",
      ι: "ί",
      ο: "ό",
      υ: "ύ",
      ω: "ώ",
    };
    const mapped = vowelMap[lower];
    if (!mapped) return char;
    return char === char.toUpperCase() ? mapped.toUpperCase() : mapped;
  };

  return (
    <div className="w-full bg-[#fbf6f1] py-3.5 px-2 sm:px-4 border-t border-[#e7d7c3] shadow-inner">
      <div className="space-y-1.5 sm:space-y-2">
        {/* Row 1 */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {row1.map((key, i) => {
            const isBack = key.value === "backspace";
            return (
              <button
                key={`r1-${i}`}
                type="button"
                disabled={disabled}
                onClick={() => handleKeyClick(key.value)}
                className={`flex h-10 items-center justify-center rounded-[6px] border text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-40 sm:h-[48px] sm:text-[17px] ${isBack
                    ? "w-10 sm:w-[52px] border-[#e7d7c3] bg-[#e5dec9]/60 text-[#4f4539]"
                    : key.isHighlighted
                      ? "w-7 sm:w-[36px] border-[#c89b5b] bg-[#bd862c] text-white"
                      : "w-7 sm:w-[36px] border-[#e7d7c3] bg-white text-[#1d1c16] hover:bg-[#fbf6f1]"
                  }`}
              >
                {key.display}
              </button>
            );
          })}
        </div>

        {/* Row 2 */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {row2.map((key, i) => {
            const isTab = key.value === "tab";
            return (
              <button
                key={`r2-${i}`}
                type="button"
                disabled={disabled}
                onClick={() => handleKeyClick(key.value)}
                className={`flex h-10 items-center justify-center rounded-[6px] border text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-40 sm:h-[48px] sm:text-[17px] ${isTab
                    ? "w-10 sm:w-[52px] border-[#e7d7c3] bg-[#e5dec9]/60 text-[#4f4539]"
                    : key.isHighlighted
                      ? "w-7 sm:w-[36px] border-[#c89b5b] bg-[#bd862c] text-white"
                      : "w-7 sm:w-[36px] border-[#e7d7c3] bg-white text-[#1d1c16] hover:bg-[#fbf6f1]"
                  }`}
              >
                {isShifted || isCaps ? key.display.toUpperCase() : key.display}
              </button>
            );
          })}
        </div>

        {/* Row 3 */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {row3.map((key, i) => {
            const isCapsKey = key.value === "caps";
            const isEnterKey = key.value === "enter";
            return (
              <button
                key={`r3-${i}`}
                type="button"
                disabled={disabled}
                onClick={() => handleKeyClick(key.value)}
                className={`flex h-10 items-center justify-center rounded-[6px] border text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-40 sm:h-[48px] sm:text-[17px] ${isCapsKey
                    ? `w-10 sm:w-[52px] border-[#e7d7c3] ${isCaps ? "bg-[#7c571e] text-white border-[#7c571e]" : "bg-[#e5dec9]/60 text-[#4f4539]"}`
                    : isEnterKey
                      ? "w-12 sm:w-[60px] border-[#c89b5b] bg-[#bd862c] text-white"
                      : key.isHighlighted
                        ? "w-7 sm:w-[36px] border-[#c89b5b] bg-[#bd862c] text-white"
                        : "w-7 sm:w-[36px] border-[#e7d7c3] bg-white text-[#1d1c16] hover:bg-[#fbf6f1]"
                  }`}
              >
                {isShifted || isCaps ? key.display.toUpperCase() : key.display}
              </button>
            );
          })}
        </div>

        {/* Row 4 */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          {row4.map((key, i) => {
            const isShiftKey = key.value === "shift";
            return (
              <button
                key={`r4-${i}`}
                type="button"
                disabled={disabled}
                onClick={() => handleKeyClick(key.value)}
                className={`flex h-10 items-center justify-center rounded-[6px] border text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-40 sm:h-[48px] sm:text-[17px] ${isShiftKey
                    ? `w-10 sm:w-[52px] border-[#e7d7c3] ${isShifted ? "bg-[#bd862c] text-white border-[#bd862c]" : "bg-[#e5dec9]/60 text-[#4f4539]"}`
                    : key.isHighlighted
                      ? "w-7 sm:w-[36px] border-[#c89b5b] bg-[#bd862c] text-white"
                      : "w-7 sm:w-[36px] border-[#e7d7c3] bg-white text-[#1d1c16] hover:bg-[#fbf6f1]"
                  }`}
              >
                {isShifted || isCaps ? key.display.toUpperCase() : key.display}
              </button>
            );
          })}
        </div>

        {/* Spacebar Row */}
        <div className="flex justify-center gap-1 sm:gap-1.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onKey(" ")}
            className="flex h-10 w-[180px] sm:w-[320px] items-center justify-center rounded-[6px] border border-[#e7d7c3] bg-white text-xs font-semibold text-[#4f4539] shadow-sm transition-all active:scale-95 disabled:opacity-40 sm:h-[48px] sm:text-base hover:bg-[#fbf6f1]"
          >
            Space
          </button>
        </div>
      </div>
    </div>
  );
}
