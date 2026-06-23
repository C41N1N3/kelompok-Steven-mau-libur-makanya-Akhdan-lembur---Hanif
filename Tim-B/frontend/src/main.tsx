import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast';
import './styles/globals.css'

import Landing from './pages/Landing.tsx'
import Login from './pages/Login.tsx'
import Register from './pages/Register.tsx'
import { AppLayout } from './components/shared/AppLayout.tsx'
import Home from './pages/Home.tsx'
import Stats from './pages/Stats.tsx'
import Leaderboard from './pages/Leaderboard.tsx'
import Settings from './pages/Settings.tsx'
import Game from './pages/Game.tsx'
import { GameLayout } from './components/game/GameLayout.tsx'

import CUBE from './components/game/CUBE.tsx'
import NING from './components/game/NING.tsx'
import MULTI from './components/game/MULTI.tsx'
import BRAIN from './components/game/BRAIN.tsx'
import DAILY from './components/game/DAILY.tsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Landing />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    element: <AppLayout username="Player" level={5} score={1250} />,
    children: [
      { path: '/home', element: <Home /> },
      { path: '/stats', element: <Stats /> },
      { path: '/leaderboard', element: <Leaderboard /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  {
    element: <GameLayout username="Player" level={5} score={1250} />,
    children: [
      { path: '/game', element: <Game /> },
      { path: '/game/cube', element: <CUBE /> },
      { path: '/game/ning', element: <NING /> },
      { path: '/game/multi', element: <MULTI /> },
      { path: '/game/brain', element: <BRAIN /> },
      { path: '/game/daily', element: <DAILY /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
    <Toaster position="bottom-right" toastOptions={{ style: { background: '#122131', color: '#D4E4FA' } }} />
  </StrictMode>,
)