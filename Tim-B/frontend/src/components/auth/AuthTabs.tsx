import { useNavigate } from 'react-router-dom'

interface AuthTabsProps {
  active: 'login' | 'register'
}

export function AuthTabs({ active }: AuthTabsProps) {
  const navigate = useNavigate()

  const underlineLeft = active === 'login' ? '0%' : '50%'

  return (
    <div className="relative w-full mb-6">
      {/* Buttons */}
      <div className="flex justify-around items-center">
        <button
          onClick={() => navigate('/login')}
          className={`flex-1 py-2 text-center font-medium transition-colors ${active === 'login' ? 'text-primary' : 'text-foreground hover:text-primary/80'}`}
        >
          Login
        </button>
        <button
          onClick={() => navigate('/register')}
          className={`flex-1 py-2 text-center font-medium transition-colors ${active === 'register' ? 'text-primary' : 'text-foreground hover:text-primary/80'}`}
        >
          Register
        </button>
      </div>

      {/* Underline container */}
      <div className="relative w-full h-0.5 bg-secondary/30 mt-1">
        <div
          className="absolute h-0.5 bg-primary rounded-full transition-all duration-300 ease-in-out"
          style={{ width: '50%', left: underlineLeft }}
        />
      </div>
    </div>
  )
}