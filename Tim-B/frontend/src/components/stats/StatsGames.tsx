interface GameStats {
  mode: string
  gamesPlayed: number
  wins: number
  losses: number
  winRate: number
  avgScore: number
}

const gameStats: GameStats[] = [
  { mode: 'Classic', gamesPlayed: 45, wins: 30, losses: 15, winRate: 66.7, avgScore: 2340 },
  { mode: 'Challenge', gamesPlayed: 32, wins: 20, losses: 12, winRate: 62.5, avgScore: 2100 },
  { mode: 'Multiplayer', gamesPlayed: 18, wins: 10, losses: 8, winRate: 55.6, avgScore: 1850 },
  { mode: 'Brain Teaser', gamesPlayed: 27, wins: 18, losses: 9, winRate: 66.7, avgScore: 2450 },
  { mode: 'Daily Challenge', gamesPlayed: 15, wins: 9, losses: 6, winRate: 60.0, avgScore: 2000 },
]

export function StatsGames() {
  return (
    <div className="bg-surface rounded-xl border border-secondary overflow-hidden">
      <div className="px-6 py-4 border-b border-secondary">
        <h2 className="text-foreground font-space-grotesk font-semibold">
          Game Mode Statistics
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-secondary bg-background/50">
              <th className="text-left text-dimmed text-sm font-medium px-6 py-3">Mode</th>
              <th className="text-right text-dimmed text-sm font-medium px-6 py-3">Played</th>
              <th className="text-right text-dimmed text-sm font-medium px-6 py-3">Wins</th>
              <th className="text-right text-dimmed text-sm font-medium px-6 py-3">Losses</th>
              <th className="text-right text-dimmed text-sm font-medium px-6 py-3">Win Rate</th>
              <th className="text-right text-dimmed text-sm font-medium px-6 py-3">Avg Score</th>
            </tr>
          </thead>
          <tbody>
            {gameStats.map((stat) => (
              <tr key={stat.mode} className="border-b border-secondary/50 hover:bg-secondary/20 transition-colors">
                <td className="px-6 py-4 text-foreground font-medium">{stat.mode}</td>
                <td className="px-6 py-4 text-right text-foreground">{stat.gamesPlayed}</td>
                <td className="px-6 py-4 text-right text-primary">{stat.wins}</td>
                <td className="px-6 py-4 text-right text-error">{stat.losses}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stat.winRate >= 65 ? 'bg-primary/10 text-primary' :
                    stat.winRate >= 50 ? 'bg-warning/10 text-warning' :
                    'bg-error/10 text-error'
                  }`}>
                    {stat.winRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-right text-foreground font-semibold">
                  {stat.avgScore.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}