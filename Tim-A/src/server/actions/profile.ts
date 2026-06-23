"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getProfileUserErrorMessage } from "@/lib/errors/user-facing";
import { createClient } from "@/lib/supabase/server";

export async function updatePreferences(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const fontSize = Number(formData.get("font_size") ?? 12);
  const payload = {
    user_id: user.id,
    primary_language: readString(formData, "primary_language", "English"),
    time_zone: readString(formData, "time_zone", "(GMT+02:00)"),
    date_format: readString(formData, "date_format", "DD/MM/YYYY"),
    font_size: Number.isFinite(fontSize)
      ? Math.min(24, Math.max(10, fontSize))
      : 12,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("user_preferences")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    redirect(
      `/profile/personalization?error=${encodeURIComponent(
        getProfileUserErrorMessage(error),
      )}`,
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/profile/personalization");
  redirect("/profile/personalization?saved=1");
}

export async function changePassword(formData: FormData) {
  const currentPassword = readString(formData, "old_password", "");
  const newPassword = readString(formData, "new_password", "");
  const confirmPassword = readString(formData, "confirm_password", "");

  if (newPassword.length < 8) {
    redirect("/profile/personalization/change-password?error=Password%20must%20be%20at%20least%208%20characters.");
  }

  if (newPassword !== confirmPassword) {
    redirect("/profile/personalization/change-password?error=Passwords%20do%20not%20match.");
  }

  const supabase = await createClient();
  const credentials = {
    password: newPassword,
    currentPassword,
  };
  const { error } = await supabase.auth.updateUser(credentials);

  if (error) {
    redirect(
      `/profile/personalization/change-password?error=${encodeURIComponent(
        getProfileUserErrorMessage(error),
      )}`,
    );
  }

  redirect("/profile/personalization/change-password?saved=1");
}

function readString(formData: FormData, key: string, fallback: string): string {
  const value = formData.get(key);
  if (typeof value !== "string") return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
