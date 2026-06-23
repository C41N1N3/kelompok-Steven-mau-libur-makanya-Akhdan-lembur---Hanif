import Image from "next/image";
import { Check } from "lucide-react";

import { getWeekDays } from "@/features/dashboard/helpers";
import { cn } from "@/lib/utils";

type Props = {
  currentStreak: number;
  practicedDates: Date[];
};

export function StreakCard({ currentStreak, practicedDates }: Props) {
  const weekDays = getWeekDays(practicedDates);

  return (
    <div className="flex min-h-[520px] flex-col items-center justify-center rounded-[20px] border border-[#e5e4e1] bg-white p-8 text-center shadow-[0_4px_12px_rgba(0,0,0,0.18)] xl:min-h-[651px]">
      <h2 className="text-[32px] font-bold text-black md:text-[40px]">
        Daily Streak
      </h2>

      <div className="my-8 flex size-[135px] items-center justify-center rounded-full border border-[#e5e4e1] bg-[#f2ede4]">
        <div className="relative size-24 overflow-hidden rounded-full">
          <Image
            src="/home/owl-mascot.png"
            alt=""
            fill
            sizes="96px"
            className="object-cover mix-blend-multiply"
          />
        </div>
      </div>

      <div className="grid w-full max-w-[560px] grid-cols-7 gap-x-2">
        {weekDays.map((day, index) => (
          <div key={index} className="flex min-w-0 flex-col items-center gap-2">
            <span className="text-base font-semibold text-[#4f4539]">
              {day.label}
            </span>
            <div
              className={cn(
                "flex size-[clamp(2rem,7vw,2.75rem)] items-center justify-center rounded-full text-base font-semibold",
                day.practiced
                  ? "bg-[#d4a24c] text-white"
                  : "bg-[#e7e2d9] text-[#817568]",
              )}
            >
              {day.practiced ? <Check className="size-4" /> : null}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-3xl font-semibold text-black md:text-4xl">
        {currentStreak > 0
          ? "You're on streak, Keep it up!"
          : "Practice today to start a streak!"}
      </p>
      <p className="mt-4 text-xl text-black">
        Consistency is the key to fluency.
      </p>
    </div>
  );
}
