import { redirect } from "next/navigation";

import { AppShell } from "@/components/layout/app-shell";
import { DashboardHeader } from "@/features/dashboard/dashboard-header";
import {
  getDashboardPreferenceStyle,
  getLanguageCode,
} from "@/features/preferences/format";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/server/queries/profile";
import { getCurrentPreferences } from "@/server/queries/preferences";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) redirect("/login");

  const [profile, preferences] = await Promise.all([
    getCurrentProfile(),
    getCurrentPreferences(),
  ]);
  const preferenceStyle = getDashboardPreferenceStyle(preferences.font_size);

  return (
    <AppShell languageCode={getLanguageCode(preferences.primary_language)}>
      <style>{preferenceStyle}</style>
      <DashboardHeader
        displayName={profile.display_name}
        avatarUrl={profile.avatar_url}
        currentStreak={profile.current_streak}
        level={profile.level}
        primaryLanguage={preferences.primary_language}
      />
      {children}
    </AppShell>
  );
}
