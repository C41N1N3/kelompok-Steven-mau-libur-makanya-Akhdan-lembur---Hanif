import Link from "next/link";
import {
  BookOpen,
  Flame,
  Headphones,
  MessageCircle,
  Mic,
  PenTool,
  Play,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getLessonBySlug, type LessonItem } from "@/server/queries/lessons";

const modeMeta: Record<
  LessonItem["kind"],
  { label: string; icon: typeof BookOpen }
> = {
  vocabulary: { label: "Vocabulary", icon: BookOpen },
  listening: { label: "Listening", icon: Headphones },
  speaking: { label: "Speaking", icon: Mic },
  conversation: { label: "Conversation", icon: MessageCircle },
  writing: { label: "Writing", icon: PenTool },
};

export default async function LessonDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const lesson = await getLessonBySlug(slug);

  return (
    <section className="mx-auto max-w-[1180px] px-5 py-6 md:px-10 md:py-8">
      <div className="rounded-[24px] border border-[#e7d7c3] bg-[#fefcfb] p-6 shadow-[0_4px_24px_rgba(156,122,82,0.08)]">
        <Badge className="rounded-full border border-[#e7d7c3] bg-[#fbf6f1] text-[#976c2f] hover:bg-[#fbf6f1]">
          {lesson.level}
        </Badge>
        <h1 className="mt-4 font-cinzel text-[32px] font-bold leading-tight text-[#7c571e]">
          {lesson.title}
        </h1>
        <p className="mt-2 max-w-3xl text-lg leading-7 text-[#4f4539]">
          {lesson.description}
        </p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {lesson.items.map((item) => {
          const meta = modeMeta[item.kind];
          const Icon = meta.icon;

          return (
            <article
              key={item.id}
              className="rounded-[24px] border border-[#e7d7c3] bg-[#fefcfb] p-6 shadow-[0_4px_24px_rgba(156,122,82,0.08)]"
            >
              <div className="mb-4 flex size-12 items-center justify-center rounded-[16px] bg-[#fbf6f1] text-[#c89b5b]">
                <Icon className="size-6" strokeWidth={1.8} />
              </div>
              <h2 className="font-cinzel text-2xl font-bold text-[#7c571e]">
                {meta.label}
              </h2>
              <p className="mt-2 min-h-12 text-lg leading-7 text-[#4f4539]">
                {item.prompt}
              </p>
              {item.greek ? (
                <p className="mt-3 font-cinzel text-2xl font-bold text-[#1d1c16]">
                  {item.greek}
                </p>
              ) : null}
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <Button
                  asChild
                  className="h-11 rounded-full bg-[#c89b5b] font-bold text-[#f6f1e8] hover:bg-[#b88945]"
                >
                  <Link
                    href={`/practice/${item.kind}?lesson=${lesson.id}&difficulty=standard`}
                  >
                    <Play className="size-4" />
                    Casual
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="h-11 rounded-full border-[#7c571e] bg-[#f8f3ea] font-bold text-[#7c571e] hover:bg-[#f2ede4]"
                >
                  <Link
                    href={`/practice/${item.kind}?lesson=${lesson.id}&difficulty=competitive`}
                  >
                    <Flame className="size-4" />
                    Competitive
                  </Link>
                </Button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
