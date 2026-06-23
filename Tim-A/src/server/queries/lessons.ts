import { notFound } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type LessonLevel =
  Database["public"]["Tables"]["lessons"]["Row"]["level"];

export type LessonSummary = {
  id: string;
  slug: string;
  title: string;
  description: string;
  level: LessonLevel;
  order_index: number;
  item_count: number;
};

export type LessonItem = {
  id: string;
  kind: Database["public"]["Tables"]["lesson_items"]["Row"]["kind"];
  prompt: string;
  greek: string | null;
  order_index: number;
};

export type LessonDetail = LessonSummary & {
  items: LessonItem[];
};

export async function getLessons(): Promise<LessonSummary[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select("id, slug, title, description, level, order_index, lesson_items(id)")
    .order("order_index", { ascending: true });

  if (error) throw new Error("Lessons could not be loaded.");

  return (data ?? []).map((lesson) => ({
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title,
    description: lesson.description,
    level: lesson.level,
    order_index: lesson.order_index,
    item_count: lesson.lesson_items.length,
  }));
}

export async function getLessonBySlug(slug: string): Promise<LessonDetail> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, level, order_index, lesson_items(id, kind, prompt, greek, order_index)",
    )
    .eq("slug", slug)
    .order("order_index", {
      ascending: true,
      referencedTable: "lesson_items",
    })
    .maybeSingle();

  if (error) throw new Error("Lesson details could not be loaded.");
  if (!data) notFound();

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    description: data.description,
    level: data.level,
    order_index: data.order_index,
    item_count: data.lesson_items.length,
    items: data.lesson_items.map((item) => ({
      id: item.id,
      kind: item.kind,
      prompt: item.prompt,
      greek: item.greek,
      order_index: item.order_index,
    })),
  };
}
