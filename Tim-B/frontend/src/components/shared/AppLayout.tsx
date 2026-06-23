import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { SidebarNav } from './SidebarNav';

interface AppLayoutProps {
  username?: string;
  level?: number;
  score?: number;
}

export function AppLayout({
  username,
  level,
  score,
}: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Sidebar – fixed, slides in/out */}
      <SidebarNav isOpen={sidebarOpen} onClose={closeSidebar} />

      {/* Content wrapper – shifts right on desktop when sidebar is open */}
      <div
        className={`
          min-h-screen flex flex-col transition-all duration-300 ease-in-out
          ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-0'}
        `}
      >
        <TopBar
          username={username}
          level={level}
          score={score}
          onToggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>

        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}