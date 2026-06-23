import Link from "next/link";
import type { ComponentType } from "react";
import {
  Award,
  CircleCheckBig,
  Flame,
  Gem,
  Headphones,
  Lock,
  Medal,
  MessageSquare,
  Star,
  Target,
  UserRound,
  Zap,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { getLevelTier, getXpProgress } from "@/features/dashboard/helpers";
import {
  getLeagueOptions,
  type LeagueId,
  type LeagueOption,
} from "@/features/leaderboard/leagues";
import { formatPreferenceDate } from "@/features/preferences/format";
import type { UserPreferences } from "@/server/queries/preferences";
import type { ProfileSummaryData } from "@/server/queries/profile";

type Props = {
  profile: ProfileSummaryData;
  preferences: UserPreferences;
};

export function ProfileSummary({ profile, preferences }: Props) {
  const xp = getXpProgress(profile.xp);
  const percentage = Math.round((xp.current / xp.total) * 100);
  const tier = getLevelTier(profile.level);
  const leagueBadges = getLeagueOptions(profile.current_league);
  const lastPractice = formatPreferenceDate(
    profile.last_practiced_on,
    preferences,
  );

  return (
    <div className="mt-8 grid w-full max-w-[1380px] gap-8 xl:grid-cols-[1fr_517px]">
      <section className="flex flex-col justify-center rounded-[20px] bg-[#faf2e9] p-8 shadow-[0_4px_16px_rgba(124,87,30,0.12)]">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          {/* Left: Avatar + Info */}
          <div className="flex items-center gap-6">
            <Avatar className="size-[120px] shrink-0 border-4 border-[#efbe7b]">
              <AvatarImage
                src={profile.avatar_url ?? undefined}
                alt={profile.display_name}
              />
              <AvatarFallback className="bg-[#f2ede4] text-4xl font-bold text-[#7c571e]">
                {getInitials(profile.display_name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h2 className="font-cinzel text-2xl text-[#1d1c16]">
                {profile.display_name}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-base text-[#4f4539]">
                <span className="rounded-full bg-[#f2ede4] px-3 py-1 font-semibold text-[#7c571e]">
                  {tier}
                </span>
                <span className="text-[#c89b5b]">•</span>
                <span>Level {profile.level}</span>
              </div>
              <div className="mt-4 w-[260px]">
                <div className="flex justify-between text-sm font-semibold text-[#4f4539]">
                  <span>Level {profile.level}</span>
                  <span>{xp.current} / {xp.total} XP</span>
                </div>
                <Progress
                  value={percentage}
                  className="mt-1.5 h-2.5 bg-[#e7e2d9] [&>div]:bg-gradient-to-r [&>div]:from-[#7c571e] [&>div]:to-[#c89b5b]"
                />
              </div>
            </div>
          </div>

          {/* Right: Personalization */}
          <div className="flex flex-col items-center gap-3 md:items-end">
            <Link
              href="/profile/personalization"
              className="inline-flex h-12 items-center gap-2 rounded-xl border-2 border-[#c89b5b] bg-white px-5 text-xl font-bold text-[#c89b5b] transition-colors hover:bg-[#fbf6f1]"
            >
              <UserRound className="size-5" />
              Personalization
            </Link>
            <p className="max-w-[300px] text-center text-base font-semibold leading-6 text-[#4f4539] md:text-right">
              Edit your preferences, audio,<br />language, and account settings.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[20px] bg-[#f9f2e9] p-8 shadow-[0_4px_16px_rgba(124,87,30,0.12)] xl:row-span-1">
        <h3 className="font-cinzel text-2xl font-bold uppercase text-[#1d1c16]">
          Badges
        </h3>
        <div className="mt-5 grid grid-cols-2 gap-3">
          {leagueBadges.map((badge) => (
            <LeagueBadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </section>

      <section className="rounded-[20px] bg-[#faf4ed] p-6 shadow-[0_4px_16px_rgba(124,87,30,0.12)]">
        <h3 className="font-cinzel text-2xl font-bold text-[#1d1c16]">
          Your Statistics
        </h3>
        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <StatItem
            icon={Zap}
            label="Total XP"
            value={profile.xp}
            iconColor="text-[#7c3aed]"
            bgColor="bg-[#ede9fe]"
          />
          <StatItem
            icon={CircleCheckBig}
            label="Lessons"
            value={lastPractice}
            iconColor="text-[#2563eb]"
            bgColor="bg-[#dbeafe]"
          />
          <StatItem
            icon={Flame}
            label="Top Streak"
            value={profile.longest_streak}
            iconColor="text-[#ef4444]"
            bgColor="bg-[#fee2e2]"
          />
          <StatItem
            icon={Target}
            label="Accuracy"
            value="92%"
            iconColor="text-[#92400e]"
            bgColor="bg-[#fef3c7]"
          />
        </div>
      </section>

      <section className="rounded-[20px] bg-[#faf4ed] p-6 shadow-[0_4px_16px_rgba(124,87,30,0.12)]">
        <h3 className="font-cinzel text-2xl font-bold text-[#1d1c16]">
          Recent Achievements
        </h3>
        <div className="mt-5 space-y-4">
          <Achievement
            icon={Flame}
            iconColor="text-[#ea580c]"
            bgColor="bg-[#fed7aa]"
            title="7-Day Streak"
            detail="Maintain a 7-day streak."
            xp="+200 XP"
            date="May 10"
          />
          <Achievement
            icon={MessageSquare}
            iconColor="text-[#b45309]"
            bgColor="bg-[#fde68a]"
            title="Conversation Master"
            detail="Complete 10 lessons."
            xp="+300 XP"
            date="May 8"
          />
          <Achievement
            icon={Headphones}
            iconColor="text-[#0369a1]"
            bgColor="bg-[#bae6fd]"
            title="Listening Pro"
            detail="Score 90% or higher."
            xp="+250 XP"
            date="May 5"
          />
        </div>
      </section>
    </div>
  );
}

function LeagueBadgeCard({ badge }: { badge: LeagueOption }) {
  const Icon = badge.unlocked ? leagueIcons[badge.id] : Lock;
  const classes = badge.unlocked
    ? leagueTones[badge.id]
    : leagueTones.locked;

  return (
    <div className={`flex h-36 flex-col items-center justify-center rounded-xl border bg-gradient-to-br ${classes}`}>
      <Icon className="size-8" strokeWidth={1.8} />
      <p className="mt-4 text-center text-base font-bold">{badge.label}</p>
    </div>
  );
}

const leagueIcons = {
  bronze: Medal,
  silver: Award,
  gold: Star,
  diamond: Gem,
} satisfies Record<LeagueId, ComponentType<{ className?: string; strokeWidth?: number }>>;

const leagueTones = {
  bronze: "from-[#e7c7a5] to-[#b7793f] border-[#9a5f2f]/40 text-[#3f2412]",
  silver: "from-[#eef2f6] to-[#aeb8c4] border-slate-400/40 text-[#1f2937]",
  gold: "from-[#fef9c3] to-[#e0b84e] border-yellow-500/40 text-[#713f12]",
  diamond: "from-[#dff7ff] to-[#7dd3fc] border-sky-400/40 text-[#075985]",
  locked: "from-[#ded9d1] to-[#ded9d1] border-[#d3c4b4]/30 text-[#817568] opacity-70",
} satisfies Record<LeagueId | "locked", string>;

function StatItem({
  icon: Icon,
  label,
  value,
  iconColor = "text-[#7c571e]",
  bgColor = "bg-[#ded9d1]",
}: {
  icon: typeof Zap;
  label: string;
  value: string | number;
  iconColor?: string;
  bgColor?: string;
}) {
  return (
    <div className="flex min-h-[126px] flex-col items-center justify-center rounded-xl bg-[#fefdfb] p-4 text-center shadow-sm">
      <div className={`flex size-12 items-center justify-center rounded-full ${bgColor} ${iconColor}`}>
        <Icon className="size-6" />
      </div>
      <p className="mt-4 text-lg font-bold text-[#1d1c16]">{value}</p>
      <p className="mt-1 text-base font-semibold uppercase tracking-wide text-[#4f4539]">
        {label}
      </p>
    </div>
  );
}

function Achievement({
  icon: Icon,
  iconColor,
  bgColor,
  title,
  detail,
  xp,
  date,
}: {
  icon: ComponentType<{ className?: string }>;
  iconColor: string;
  bgColor: string;
  title: string;
  detail: string;
  xp: string;
  date: string;
}) {
  return (
    <div className="grid grid-cols-[48px_1fr_auto] items-center gap-4 border-b border-[#e7e2d9] pb-4 last:border-b-0">
      <div className={`flex size-12 shrink-0 items-center justify-center rounded-full ${bgColor} ${iconColor}`}>
        <Icon className="size-6" />
      </div>
      <div>
        <p className="text-lg font-semibold text-[#1d1c16]">{title}</p>
        <p className="text-base text-[#4f4539]">{detail}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold text-[#d4a24c]">{xp}</p>
        <p className="text-base text-[#4f4539]">{date}</p>
      </div>
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
