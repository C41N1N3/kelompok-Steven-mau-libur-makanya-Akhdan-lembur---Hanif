import { NavLink } from 'react-router-dom'
import HomeIcon from "../../assets/homeIcon.svg";
import StatsIcon from "../../assets/statsIcon.svg";
import LeaderboardIcon from "../../assets/leaderboardIcon.svg";
import SettingsIcon from "../../assets/settingsIcon.svg";

const navItems = [
  { path: '/home', label: 'Home', icon: HomeIcon },
  { path: '/stats', label: 'Stats', icon: StatsIcon },
  { path: '/leaderboard', label: 'Leaderboard', icon: LeaderboardIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
]

export function BottomNav() {
  return (
    <nav className="flex items-center justify-around bg-surface border-t border-secondary px-2 py-1.5">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
              isActive 
                ? 'text-primary' 
                : 'text-semitone hover:text-primary/80'
            }`
          }
        >
          <Icon className="w-6 h-6" />
          <span className="text-[10px] font-medium">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}