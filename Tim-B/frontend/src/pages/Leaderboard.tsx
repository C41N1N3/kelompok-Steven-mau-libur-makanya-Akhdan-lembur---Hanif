import { useState, useRef, useEffect } from 'react'
import { PageTransition } from '../components/shared/PageTransition';
import { SkeletonLeaderboard } from '../components/shared/skeletons/SkeletonLeaderboard';
import { showToast } from '../utils/toast';

// Types
interface User {
  id: number
  rank: number
  name: string
  avatar: string
  score: number
  games: number
  winRate: number
}

// Mock data – 20 users with descending scores
const mockUsers: User[] = [
  { id: 1, rank: 1, name: 'PizzaMozzarella', avatar: '𒁀', score: 9850, games: 142, winRate: 68 },
  { id: 2, rank: 2, name: 'BrainMaster', avatar: '𓀂', score: 9420, games: 128, winRate: 72 },
  { id: 3, rank: 3, name: 'LogicPro', avatar: '𓅆', score: 9100, games: 110, winRate: 65 },
  { id: 4, rank: 4, name: 'SpeedDemon', avatar: '𓋒', score: 8870, games: 95, winRate: 79 },
  { id: 5, rank: 5, name: 'MemoryKing', avatar: '𓍳', score: 8650, games: 103, winRate: 61 },
  { id: 6, rank: 6, name: 'FocusMaster', avatar: '𐤒', score: 8320, games: 87, winRate: 70 },
  { id: 7, rank: 7, name: 'CreativeMind', avatar: '𓅢', score: 8100, games: 92, winRate: 66 },
  { id: 8, rank: 8, name: 'ReactionPro', avatar: '𓃺', score: 7850, games: 78, winRate: 74 },
  { id: 9, rank: 9, name: 'TriviaKing', avatar: '𓀪', score: 7600, games: 85, winRate: 58 },
  { id: 10, rank: 10, name: 'MathWizard', avatar: '𓀇', score: 7350, games: 70, winRate: 80 },
  { id: 11, rank: 11, name: 'WordGenius', avatar: '𒀫', score: 7100, games: 65, winRate: 63 },
  { id: 12, rank: 12, name: 'Player', avatar: '𒁍', score: 6850, games: 59, winRate: 71 },
  { id: 13, rank: 13, name: 'SwiftThinker', avatar: '𒀁', score: 6600, games: 55, winRate: 67 },
  { id: 14, rank: 14, name: 'BrainStorm', avatar: '𒆸', score: 6350, games: 48, winRate: 73 },
  { id: 15, rank: 15, name: 'NeuralNinja', avatar: '𒉽', score: 6100, games: 42, winRate: 69 },
  { id: 16, rank: 16, name: 'CortexKing', avatar: '𒈦', score: 5850, games: 38, winRate: 62 },
  { id: 17, rank: 17, name: 'MindReader', avatar: '𒔼', score: 5600, games: 33, winRate: 75 },
  { id: 18, rank: 18, name: 'LogicLegend', avatar: '𒁀', score: 5350, games: 29, winRate: 66 },
  { id: 19, rank: 19, name: 'FocusNinja', avatar: '𐏓', score: 5100, games: 25, winRate: 72 },
  { id: 20, rank: 20, name: 'QuantumMind', avatar: '𐎣', score: 4850, games: 21, winRate: 68 },
]

// Current user (e.g., the logged-in user)
const CURRENT_USER_ID = 12 // change to test

export default function Leaderboard() {
  const [users] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFloatingButton, setShowFloatingButton] = useState(false)
  const [currentUserId] = useState(CURRENT_USER_ID)
  const userRowRef = useRef<HTMLTableRowElement>(null)
  const [isLoading, setIsLoading] = useState(true);

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Find current user's rank
  const currentUser = users.find(u => u.id === currentUserId)
  const currentUserRank = currentUser?.rank

  // Show/hide floating button based on scroll position
  useEffect(() => {
    const timer_load = setTimeout(() => setIsLoading(false), 500);
    const handleScroll = () => {
      const scrollY = window.scrollY
      // Show button after scrolling 100px
      setShowFloatingButton(scrollY > 100)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(timer_load)
    }
  }, [])

  if (isLoading) return <SkeletonLeaderboard />;

  // Scroll to current user's row
  const scrollToUser = () => {
    if (userRowRef.current) {
      userRowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }

  // Get medal emoji for top 3
  const getRankDisplay = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <PageTransition>
    <div className="space-y-4 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-space-grotesk text-foreground font-semibold">
            Leaderboard
          </h1>
          <p className="text-dimmed text-sm">Top players this month</p>
        </div>

        {/* Search bar only */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-48 bg-background text-foreground border border-secondary rounded-lg px-4 py-2 pl-9 focus:outline-none focus:border-primary transition-colors placeholder:text-muted text-sm"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-dimmed">🔍</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface rounded-xl border border-secondary overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-secondary bg-background/50">
                <th className="text-left text-dimmed text-sm font-medium px-6 py-3 w-16">Rank</th>
                <th className="text-left text-dimmed text-sm font-medium px-6 py-3">User</th>
                <th className="text-right text-dimmed text-sm font-medium px-6 py-3">Score</th>
                <th className="text-right text-dimmed text-sm font-medium px-6 py-3 hidden sm:table-cell">Games</th>
                <th className="text-right text-dimmed text-sm font-medium px-6 py-3 hidden md:table-cell">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-dimmed py-8">
                    No players found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isCurrentUser = user.id === currentUserId
                  return (
                    <tr
                      key={user.id}
                      ref={isCurrentUser ? userRowRef : null}
                      className={`
                        border-b border-secondary/50 hover:bg-secondary/20 transition-colors
                        ${isCurrentUser ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                      `}
                    >
                      <td className="px-6 py-4">
                        <span className={`
                          font-medium text-sm
                          ${user.rank <= 3 ? 'text-xl' : 'text-foreground'}
                        `}>
                          {getRankDisplay(user.rank)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-lg">
                            {user.avatar}
                          </div>
                          <div>
                            <p className="text-foreground font-medium">
                              {user.name}
                              {isCurrentUser && (
                                <span className="ml-2 text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-foreground font-semibold">
                        {user.score.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-dimmed hidden sm:table-cell">
                        {user.games}
                      </td>
                      <td className="px-6 py-4 text-right hidden md:table-cell">
                        <span className={`
                          px-2 py-1 rounded-full text-xs font-medium
                          ${user.winRate >= 70 ? 'bg-primary/10 text-primary' :
                            user.winRate >= 50 ? 'bg-warning/10 text-warning' :
                            'bg-error/10 text-error'}
                        `}>
                          {user.winRate}%
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex justify-between items-center text-dimmed text-sm">
        <span>Showing {filteredUsers.length} of {users.length} players</span>
        {currentUserRank && (
          <span>Your rank: #{currentUserRank}</span>
        )}
      </div>

      {/* Floating "Jump to My Rank" Button */}
      {currentUserRank && (
        <button
          onClick={scrollToUser}
          className={`
            fixed bottom-24 right-4 z-40
            flex items-center gap-2
            bg-primary text-background font-semibold
            px-4 py-3 rounded-full shadow-lg
            hover:bg-primary/80 transition-all duration-300
            ${showFloatingButton 
              ? 'opacity-100 translate-y-0 pointer-events-auto' 
              : 'opacity-0 translate-y-4 pointer-events-none'
            }
          `}
          aria-label="Jump to my rank"
        >
          <span className="text-lg">📍</span>
          <span className="text-sm whitespace-nowrap">Jump to # {currentUserRank}</span>
        </button>
      )}
      </div>
    </PageTransition>
  )
}