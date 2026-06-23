import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  Headphones,
  MessageCircle,
  Mic,
  PenTool,
  Target,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { LessonSummary } from "@/server/queries/lessons";

const modeIcons = [BookOpen, Headphones, Mic, MessageCircle, PenTool];

type Props = {
  lesson: LessonSummary;
};

export function LessonCard({ lesson }: Props) {
  const levelLabel = formatLevel(lesson.level);

  return (
    <article className="rounded-[24px] border border-[#e7d7c3] bg-[#fefcfb] p-5 shadow-[0_4px_24px_rgba(156,122,82,0.08)] transition-colors hover:border-[#c89b5b] sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge className="rounded-full border border-[#e7d7c3] bg-[#fbf6f1] text-[#976c2f] hover:bg-[#fbf6f1]">
              <GraduationCap className="size-3" />
              {levelLabel}
            </Badge>
            <span className="inline-flex items-center gap-1 text-base font-semibold text-[#817568]">
              <Target className="size-3.5" />
              {lesson.item_count} activities
            </span>
          </div>
          <h2 className="font-cinzel text-2xl font-bold leading-tight text-[#7c571e]">
            {lesson.title}
          </h2>
          <p className="mt-2 line-clamp-2 text-lg leading-7 text-[#4f4539]">
            {lesson.description}
          </p>
        </div>

        <Button
          asChild
          size="sm"
          className="h-11 rounded-full bg-[#c89b5b] px-5 font-bold text-[#f6f1e8] hover:bg-[#b88945]"
        >
          <Link href={`/learn/${lesson.slug}`}>
            Open
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {modeIcons.map((Icon, index) => (
          <span
            key={index}
            className="flex size-10 items-center justify-center rounded-[14px] border border-[#e7d7c3] bg-[#fbf6f1] text-[#976c2f]"
          >
            <Icon className="size-5" strokeWidth={1.8} />
          </span>
        ))}
      </div>
    </article>
  );
}

function formatLevel(level: LessonSummary["level"]): string {
  return level.charAt(0).toUpperCase() + level.slice(1);
}
