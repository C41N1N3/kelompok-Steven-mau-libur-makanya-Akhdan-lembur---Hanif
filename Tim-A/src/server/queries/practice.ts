import type { PracticeMode } from "@/features/difficulty/rules";
import { ensurePracticeItemsForMode } from "@/features/practice/dummy-items";
import { createClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

type LessonItemRow = Pick<
  Database["public"]["Tables"]["lesson_items"]["Row"],
  | "id"
  | "kind"
  | "prompt"
  | "greek"
  | "options"
  | "answer"
  | "scenario_goals"
  | "order_index"
>;

export type PracticeItem = Omit<LessonItemRow, "options" | "scenario_goals"> & {
  options: string[];
  scenario_goals: string[];
};

export async function getLessonItemsForMode(
  lessonId: string,
  mode: PracticeMode,
): Promise<PracticeItem[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lesson_items")
    .select("id, kind, prompt, greek, options, answer, scenario_goals, order_index")
    .eq("lesson_id", lessonId)
    .eq("kind", mode)
    .order("order_index", { ascending: true });

  if (error) throw new Error("Practice items could not be loaded.");

  const items = (data ?? []).map((item) => ({
    ...item,
    options: toStringArray(item.options),
    scenario_goals: toStringArray(item.scenario_goals),
  }));

  return ensurePracticeItemsForMode(lessonId, mode, items);
}

function toStringArray(value: Json): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}
