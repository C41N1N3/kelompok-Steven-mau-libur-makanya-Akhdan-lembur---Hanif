import { ProfileSummary } from "@/features/profile/profile-summary";
import { getCurrentProfile } from "@/server/queries/profile";
import { getCurrentPreferences } from "@/server/queries/preferences";

export default async function ProfilePage() {
  const [profile, preferences] = await Promise.all([
    getCurrentProfile(),
    getCurrentPreferences(),
  ]);

  return (
    <section className="mx-auto flex w-full max-w-[1480px] justify-center px-5 py-8 md:px-[67px] md:py-[44px]">
      <ProfileSummary profile={profile} preferences={preferences} />
    </section>
  );
}
