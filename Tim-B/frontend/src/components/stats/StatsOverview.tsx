import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { useState, useEffect } from 'react'
import { PageTransition } from '../shared/PageTransition'
import { SkeletonStatsOverview } from '../shared/skeletons/SkeletonStatsOverview'

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
)

const radarData = {
  labels: ['Memory', 'Logic', 'Reaction', 'Focus', 'Creativity', 'Speed'],
  datasets: [
    {
      label: 'Your Performance',
      data: [85, 72, 90, 68, 78, 82],
      backgroundColor: 'rgba(76, 215, 246, 0.2)',
      borderColor: '#4CD7F6',
      borderWidth: 2,
      pointBackgroundColor: '#4CD7F6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#4CD7F6',
    },
    {
      label: 'Average',
      data: [65, 60, 70, 55, 62, 58],
      backgroundColor: 'rgba(148, 163, 184, 0.1)',
      borderColor: '#94A3B8',
      borderWidth: 1.5,
      pointBackgroundColor: '#94A3B8',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#94A3B8',
      borderDash: [5, 5],
    },
  ],
}

const chartOptions = {
  scales: {
    r: {
      angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
      grid: { color: 'rgba(255, 255, 255, 0.1)' },
      pointLabels: {
        color: '#D4E4FA',
        font: { size: 12, family: 'Space Grotesk' },
      },
      ticks: {
        backdropColor: 'transparent',
        color: '#64748B',
        stepSize: 20,
      },
      max: 100,
      min: 0,
    },
  },
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        color: '#D4E4FA',
        padding: 20,
        usePointStyle: true,
        pointStyle: 'circle',
        font: { size: 12, family: 'Space Grotesk' },
      },
    },
    tooltip: {
      backgroundColor: '#122131',
      borderColor: '#273647',
      borderWidth: 1,
      titleColor: '#D4E4FA',
      bodyColor: '#94A3B8',
      cornerRadius: 8,
      padding: 12,
    },
  },
  responsive: true,
  maintainAspectRatio: false,
}

const stats = [
  { label: 'Games Played', value: '247', change: '+12%' },
  { label: 'Win Rate', value: '68%', change: '+5%' },
  { label: 'Current Streak', value: '8', change: '+2' },
  { label: 'Total Score', value: '18,450', change: '+1,230' },
]

export function StatsOverview() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer_load = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer_load);
  }, []);

  if (isLoading) return <SkeletonStatsOverview />;

  return (
    <PageTransition>
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="bg-surface rounded-xl border border-secondary p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-foreground font-space-grotesk font-semibold">
            Skill Breakdown
          </h2>
          <span className="text-dimmed text-sm">Last 30 days</span>
        </div>
        <div className="h-80">
          <Radar data={radarData} options={chartOptions} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-surface rounded-xl border border-secondary p-4"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-dimmed text-sm">{stat.label}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-foreground text-2xl font-semibold">
                {stat.value}
              </span>
              <span className="text-primary text-sm font-medium">
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
    </PageTransition>
  )
}