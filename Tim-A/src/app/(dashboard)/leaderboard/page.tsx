import { LeaderboardTable } from "@/features/leaderboard/leaderboard-table";
import { getLeaderboardPage } from "@/server/queries/leaderboard";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; league?: string }>;
}) {
  const params = await searchParams;
  const requestedPage = Number(params.page ?? "1");
  const page = Number.isFinite(requestedPage) ? requestedPage : 1;
  const leaderboard = await getLeaderboardPage(page, 20, params.league);

  return (
    <section className="mx-auto max-w-[1480px] px-5 py-8 md:px-[72px] md:py-[44px]">
      <LeaderboardTable {...leaderboard} />
    </section>
  );
}
