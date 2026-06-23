interface HistoryEntry {
  game: string
  score: number
  date: string
  result: 'Win' | 'Loss'
}

const recentGames: HistoryEntry[] = [
  { game: 'Memory Match', score: 2450, date: '2 hours ago', result: 'Win' },
  { game: 'Brain Teaser', score: 1800, date: '5 hours ago', result: 'Loss' },
  { game: 'Quick Math', score: 3200, date: '1 day ago', result: 'Win' },
  { game: 'Word Scramble', score: 2100, date: '2 days ago', result: 'Win' },
  { game: 'Trivia Quiz', score: 1500, date: '3 days ago', result: 'Loss' },
  { game: 'Classic Puzzle', score: 2750, date: '4 days ago', result: 'Win' },
  { game: 'Challenge Mode', score: 1900, date: '5 days ago', result: 'Loss' },
  { game: 'Multiplayer', score: 3100, date: '1 week ago', result: 'Win' },
  { game: 'Daily Challenge', score: 1650, date: '1 week ago', result: 'Loss' },
  { game: 'Brain Teaser', score: 2300, date: '2 weeks ago', result: 'Win' },
]

export function StatsHistory() {
  return (
    <div className="bg-surface rounded-xl border border-secondary overflow-hidden">
      <div className="px-6 py-4 border-b border-secondary">
        <h2 className="text-foreground font-space-grotesk font-semibold">
          Recent Games
        </h2>
      </div>
      <div className="divide-y divide-secondary">
        {recentGames.map((game, index) => (
          <div key={index} className="px-6 py-3 flex items-center justify-between">
            <div>
              <p className="text-foreground font-medium">{game.game}</p>
              <p className="text-dimmed text-sm">{game.date}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-foreground font-semibold">
                {game.score.toLocaleString()}
              </span>
              <span
                className={`text-sm font-medium px-2 py-1 rounded ${
                  game.result === 'Win'
                    ? 'text-primary bg-primary/10'
                    : 'text-error bg-error/10'
                }`}
              >
                {game.result}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}