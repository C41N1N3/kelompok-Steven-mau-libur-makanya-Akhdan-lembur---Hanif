import { Progress } from "@/components/ui/progress";
import { getLevelTier, getXpProgress } from "@/features/dashboard/helpers";

type Props = {
  level: number;
  xp: number;
};

export function LevelProgressCard({ level, xp }: Props) {
  const tier = getLevelTier(level);
  const { current, total, toNext } = getXpProgress(xp);
  const percentage = Math.round((current / total) * 100);

  return (
    <div className="rounded-[20px] border border-[#e5e4e1] bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
        <div>
          <p className="text-xl font-bold text-[#1d1c16]">Your Level</p>
          <p className="font-cinzel text-[32px] font-bold leading-tight text-[#7c571e]">
            Level {level}
          </p>
          <p className="mt-1 text-lg leading-7 text-[#4f4539]">{tier}</p>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-lg text-[#4f4539]">
            <span>XP Progress</span>
            <span>
              {current} / {total} XP
            </span>
          </div>
          <Progress
            value={percentage}
            className="h-2.5 bg-[#e7e2d9] [&>div]:bg-gradient-to-r [&>div]:from-[#e0b84e] [&>div]:to-[#d4a24c]"
          />
          <p className="text-right text-lg text-[#4f4539]">
            {toNext} XP to next level
          </p>
        </div>
      </div>
    </div>
  );
}
