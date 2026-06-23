import { Heart, Timer, Zap } from "lucide-react";

import { Progress } from "@/components/ui/progress";
import type { DifficultyConfig } from "@/features/difficulty/rules";

type Props = {
  progress: number;
  config: DifficultyConfig;
  health: number | null;
  remainingSeconds?: number | null;
};

export function ProgressHeader({
  progress,
  config,
  health,
  remainingSeconds,
}: Props) {
  return (
    <div className="space-y-3">
      <Progress
        value={progress}
        className="h-3 bg-[#ece8df] [&>div]:bg-[#c89b5b] [&>div]:shadow-[0_0_8px_rgba(200,155,91,0.4)]"
      />
      {config.difficulty === "competitive" ? (
        <div className="flex flex-wrap gap-2 text-base text-[#4f4539]">
          {config.timeLimitSeconds ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e7d7c3] bg-[#fbf6f1] px-3.5">
              <Timer className="size-4" />
              {remainingSeconds ?? config.timeLimitSeconds}s
            </span>
          ) : null}
          {config.usesHealth ? (
            <span className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e7d7c3] bg-[#fbf6f1] px-3.5">
              <Heart className="size-4" />
              {health ?? config.startingHealth}
            </span>
          ) : null}
          <span className="inline-flex h-10 items-center gap-2 rounded-[12px] border border-[#e7d7c3] bg-[#fbf6f1] px-3.5">
            <Zap className="size-4" />
            {config.xpMultiplier}x XP
          </span>
        </div>
      ) : null}
    </div>
  );
}
