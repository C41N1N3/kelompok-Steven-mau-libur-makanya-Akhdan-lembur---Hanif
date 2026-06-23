import Link from "next/link";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Lock,
  Trophy,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  getLeagueOptions,
  LEAGUE_LABELS,
  type LeagueId,
} from "@/features/leaderboard/leagues";
import type { LeaderboardRow } from "@/server/queries/leaderboard";

type Props = {
  rows: LeaderboardRow[];
  count: number;
  page: number;
  pageSize: number;
  currentRank: number | null;
  currentLeague: LeagueId;
  selectedLeague: LeagueId;
};

export function LeaderboardTable({
  rows,
  count,
  page,
  pageSize,
  currentRank,
  currentLeague,
  selectedLeague,
}: Props) {
  const hasPrevious = page > 1;
  const hasNext = page * pageSize < count;
  const displayRows = rows.length > 0 ? rows : [];
  const podiumRows = displayRows.slice(0, 3);
  const leagueOptions = getLeagueOptions(currentLeague);
  const selectedLeagueLabel = LEAGUE_LABELS[selectedLeague];

  return (
    <div className="grid gap-9 xl:grid-cols-[566px_1fr]">
      <div className="space-y-9">
        <section className="min-h-[377px] rounded-[20px] bg-white p-8 text-center shadow-[0_4px_16px_rgba(200,155,91,0.12)]">
          <h1 className="text-[32px] font-semibold text-[#1d1c16]">
            Your League
          </h1>
          <Trophy className="mx-auto mt-7 size-20 text-[#e0b84e]" strokeWidth={1.8} />
          <p className="mt-7 font-cinzel text-[40px] font-bold leading-none text-[#e0b84e]">
            {LEAGUE_LABELS[currentLeague]}
          </p>
          <p className="mx-auto mt-4 max-w-[350px] text-2xl leading-tight text-black">
            {currentRank
              ? `You're currently rank #${currentRank}. Keep earning XP to climb.`
              : "Complete practice sessions to enter Bronze League."}
          </p>
        </section>

        <details className="group/filter relative">
          <summary className="flex h-[95px] w-full cursor-pointer list-none items-center justify-center gap-3 rounded-[10px] border border-black bg-white text-[32px] text-black transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-[#c89b5b] hover:shadow-[0_10px_28px_rgba(200,155,91,0.18)] focus-visible:border-[#c89b5b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c89b5b]/30 [&::-webkit-details-marker]:hidden">
            League
            <span className="text-2xl text-[#817568]">{selectedLeagueLabel}</span>
            <ChevronDown className="size-8 transition-transform duration-200 ease-out group-open/filter:rotate-180 group-hover/filter:translate-y-1" />
          </summary>
          <div className="absolute z-10 mt-3 w-full overflow-hidden rounded-[16px] border border-[#d3c4b4] bg-white shadow-[0_12px_32px_rgba(79,69,57,0.18)]">
            {leagueOptions.map((league) => (
              <Link
                key={league.id}
                href={`/leaderboard?league=${league.id}`}
                aria-disabled={!league.unlocked}
                className={`flex items-center justify-between px-5 py-4 text-xl font-semibold ${
                  league.unlocked
                    ? "text-[#1d1c16] hover:bg-[#fbf6f1]"
                    : "pointer-events-none text-[#817568] opacity-70"
                }`}
              >
                {league.label}
                {!league.unlocked ? <Lock className="size-5" /> : null}
              </Link>
            ))}
          </div>
        </details>
      </div>

      <div className="space-y-7">
        <section className="rounded-[20px] bg-white p-6 text-center shadow-[0_4px_16px_rgba(200,155,91,0.12)]">
          <h2 className="text-[32px] font-semibold text-[#1d1c16]">
            Top 3 This Week
          </h2>
          <div className="mt-7 grid grid-cols-3 items-end gap-5">
            {podiumRows.length > 0 ? (
              podiumRows.map((person, index) => (
                <PodiumPerson
                  key={person.id ?? index}
                  name={person.display_name}
                  xp={person.xp}
                  rank={index + 1}
                  avatarUrl={person.avatar_url}
                />
              ))
            ) : (
              <p className="col-span-3 py-12 text-[#4f4539]">
                Complete practice to claim the first podium spot.
              </p>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_20px_rgba(200,155,91,0.12)]">
          {displayRows.length > 0 ? (
            displayRows.map((row, index) => {
              const isFirst = index === 0;

              return (
                <div
                  key={row.id}
                  className={`grid h-20 grid-cols-[52px_48px_1fr_auto] items-center gap-4 border-t border-[#d3c4b4] px-6 first:border-t-0 ${
                    isFirst ? "border-l-4 border-l-[#c89b5b] bg-[#f2ede4]" : ""
                  }`}
                >
                  <span
                    className={`text-center font-bold ${
                      isFirst ? "text-[#c89b5b]" : "text-[#4f4539]"
                    }`}
                  >
                    {row.rank}
                  </span>
                  <Avatar className="size-12 border border-[#ded9d1]">
                    <AvatarImage
                      src={row.avatar_url ?? undefined}
                      alt={row.display_name}
                    />
                    <AvatarFallback className="bg-[#e7e2d9] font-bold text-[#817568]">
                      {getInitials(row.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <p
                    className={`truncate text-xl ${
                      isFirst
                        ? "font-semibold text-[#c89b5b]"
                        : "text-[#1d1c16]"
                    }`}
                  >
                    {row.display_name}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      isFirst ? "text-[#c89b5b]" : "text-[#4f4539]"
                    }`}
                  >
                    {row.xp} XP
                  </p>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-[#4f4539]">
              Complete practice sessions to start filling the leaderboard.
            </div>
          )}
        </section>

        <div className="flex items-center justify-end gap-2">
          {hasPrevious ? (
            <Button asChild variant="outline" size="sm">
              <Link
                href={`/leaderboard?league=${selectedLeague}&page=${Math.max(1, page - 1)}`}
              >
                <ChevronLeft className="size-4" />
                Previous
              </Link>
            </Button>
          ) : null}
          {hasNext ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/leaderboard?league=${selectedLeague}&page=${page + 1}`}>
                Next
                <ChevronRight className="size-4" />
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function PodiumPerson({
  name,
  xp,
  rank,
  avatarUrl,
}: {
  name: string;
  xp: number;
  rank: number;
  avatarUrl: string | null;
}) {
  const height = rank === 1 ? "h-[102px]" : rank === 2 ? "h-[61px]" : "h-11";
  const bar =
    rank === 1
      ? "bg-gradient-to-t from-[#c89b5b] to-[#efbe7b]"
      : rank === 2
        ? "bg-[#d3c4b4]"
        : "bg-[#99cbff]";

  return (
    <div className="flex flex-col items-center">
      <Avatar className="relative size-16 border-4 border-white bg-[#e7e2d9] font-bold text-[#4f4539] shadow">
        <AvatarImage src={avatarUrl ?? undefined} alt={name} />
        <AvatarFallback className="bg-[#e7e2d9] font-bold text-[#4f4539]">
          {getInitials(name)}
        </AvatarFallback>
        <span className="absolute -bottom-4 flex size-8 items-center justify-center rounded-full border-2 border-white bg-[#e0b84e] text-base font-semibold text-white">
          {rank}
        </span>
      </Avatar>
      <p className="mt-6 text-xl font-semibold text-[#1d1c16]">{name}</p>
      <p className="text-lg text-[#817568]">{xp.toLocaleString()} XP</p>
      <div className={`mt-3 w-14 rounded-t-lg ${height} ${bar}`} />
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
