import { useState } from 'react'
import StatsIcon from "../assets/statsIcon.svg"
import { StatsOverview } from '../components/stats/StatsOverview'
import { StatsGames } from '../components/stats/StatsGames'
import { StatsHistory } from '../components/stats/StatsHistory'

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'games', label: 'Games' },
  { id: 'history', label: 'History' },
]

export default function Stats() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-secondary border border-[#3D494C] flex items-center justify-center">
          <StatsIcon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-space-grotesk text-foreground font-semibold">
            Your Statistics
          </h1>
          <p className="text-dimmed text-sm">Track your brain training progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-secondary">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                pb-3 text-sm font-medium transition-colors relative
                ${activeTab === tab.id
                  ? 'text-primary'
                  : 'text-dimmed hover:text-foreground'
                }
              `}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && <StatsOverview />}
        {activeTab === 'games' && <StatsGames />}
        {activeTab === 'history' && <StatsHistory />}
      </div>
    </div>
  )
}