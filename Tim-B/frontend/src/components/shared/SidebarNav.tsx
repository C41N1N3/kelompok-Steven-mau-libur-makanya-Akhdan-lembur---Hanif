import { NavLink } from 'react-router-dom'

import BrainWaveLogo from '../../assets/brainwave.svg'
import HomeIcon from "../../assets/homeIcon.svg";
import StatsIcon from "../../assets/statsIcon.svg";
import LeaderboardIcon from "../../assets/leaderboardIcon.svg";
import SettingsIcon from "../../assets/settingsIcon.svg";

const navItems = [
  { path: '/home', label: 'Home', icon: HomeIcon },
  { path: '/stats', label: 'Stats', icon: StatsIcon },
  { path: '/leaderboard', label: 'Leaderboard', icon: LeaderboardIcon },
  { path: '/settings', label: 'Settings', icon: SettingsIcon },
];

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  return (
    <>
      {/* Overlay – only on small screens */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-surface border-r border-secondary z-50
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${isOpen ? 'lg:translate-x-0' : 'lg:-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full py-4">
          {/* Close button – visible only on small screens */}
          <button
            onClick={onClose}
            className="lg:hidden self-end mr-4 text-foreground hover:text-primary"
          >
            ✕
          </button>

          <nav className="flex-1 flex flex-col gap-1 px-3">
            <div className="flex items-center gap-3 my-4 mx-auto">
              <BrainWaveLogo className="w-12 h-12" />
              <p className='text-primary text-2xl'>BrainWave</p>
            </div>
            
            {navItems.map(({ path, label, icon: Icon }) => (
              <NavLink
                key={path}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-semitone hover:text-foreground hover:bg-secondary/30'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}