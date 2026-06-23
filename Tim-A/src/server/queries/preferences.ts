import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type UserPreferences = {
  primary_language: string;
  time_zone: string;
  date_format: string;
  font_size: number;
};

export const defaultUserPreferences: UserPreferences = {
  primary_language: "English",
  time_zone: "(GMT+02:00)",
  date_format: "DD/MM/YYYY",
  font_size: 12,
};

export async function getCurrentPreferences(): Promise<UserPreferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("user_preferences")
    .select("primary_language, time_zone, date_format, font_size")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) throw new Error("Your preferences could not be loaded.");

  return data ?? defaultUserPreferences;
}
