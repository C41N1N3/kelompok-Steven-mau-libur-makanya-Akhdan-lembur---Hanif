import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { DashboardLesson } from "@/features/dashboard/queries";

type Props = {
  lesson: DashboardLesson | null;
};

export function LessonOfTheDayCard({ lesson }: Props) {
  if (!lesson) {
    return (
      <div className="rounded-[20px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
        <p className="text-3xl font-semibold text-[#1d1c16]">
          Lesson of the Day
        </p>
        <p className="mt-2 text-lg text-[#817568]">No lesson available yet.</p>
        <Button
          asChild
          className="mt-5 rounded-[14px] bg-gradient-to-r from-[#7c571e] to-[#9c7a52] text-white"
          size="sm"
        >
          <Link href="/learn">Browse Lessons</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-white p-6 shadow-[0_4px_12px_rgba(0,0,0,0.18)]">
      <h2 className="text-[28px] font-bold leading-tight text-[#1d1c16]">
        Lesson of the Day
      </h2>
      <div className="mt-4 grid gap-5 rounded-[6px] bg-[#f2e3c8] p-4 md:grid-cols-[260px_minmax(0,1fr)] md:items-center">
        <div className="relative min-h-[180px] overflow-hidden rounded-[6px] shadow-[0_4px_10px_rgba(0,0,0,0.16)]">
          <Image
            src="/home/greek-cafe.png"
            alt=""
            fill
            sizes="260px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-cinzel text-[20px] font-bold uppercase leading-none text-[#1d1c16] sm:text-[24px]">
            At The Café
          </h3>
          <div className="mt-3 h-0.5 w-full max-w-[260px] bg-[#1d1c16]" />
          <p className="mt-4 max-w-[430px] text-[16px] font-bold leading-[1.45] text-[#4f4539]">
            Learn how to casually order food and drinks in a traditional Greek
            café environment. Focus on polite requests and common items.
          </p>
          <Button
            asChild
            className="mt-4 h-12 rounded-[10px] bg-[#9a6d28] px-8 text-base font-bold text-white shadow-[0_4px_8px_rgba(0,0,0,0.16)] hover:bg-[#875e21]"
          >
            <Link
              href={`/learn?difficulty=standard&lesson=${lesson.id}&confirm=conversation&from=dashboard`}
            >
              Start Lesson
              <ArrowRight className="size-5 stroke-[2.4]" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
