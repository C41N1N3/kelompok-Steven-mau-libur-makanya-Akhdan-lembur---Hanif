import { createClient } from "@/lib/supabase/server";

export type DashboardProfile = {
  display_name: string;
  avatar_url: string | null;
  xp: number;
  level: number;
  current_streak: number;
};

export type DashboardLesson = {
  id: string;
  slug: string;
  title: string;
  description: string;
};

export async function getProfile(
  userId: string,
): Promise<DashboardProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, avatar_url, xp, level, current_streak")
    .eq("id", userId)
    .single();
  return data;
}

export async function getPracticeHistory(userId: string): Promise<Date[]> {
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const { data } = await supabase
    .from("practice_sessions")
    .select("started_at")
    .eq("user_id", userId)
    .gte("started_at", sevenDaysAgo.toISOString())
    .eq("status", "completed");

  return (data ?? []).map((row) => new Date(row.started_at));
}

export async function getLessonOfTheDay(): Promise<DashboardLesson | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("lessons")
    .select("id, slug, title, description")
    .order("order_index", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
}
