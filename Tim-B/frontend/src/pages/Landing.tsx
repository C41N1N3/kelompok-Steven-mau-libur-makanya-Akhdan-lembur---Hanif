import { Link } from 'react-router-dom'
import BrainWaveLogo from '../assets/brainwave.svg'

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        <BrainWaveLogo className="mx-auto w-24 h-24 mb-6" />
        <h1 className="text-5xl text-primary font-bold tracking-tight">BrainWave</h1>
        <p className="text-foreground text-lg mt-2 opacity-80">Brain Training Simplified</p>
        <div className="w-16 h-1 bg-primary/50 mx-auto my-6 rounded-full" />
        
        <div className="space-y-4">
          <Link to="/register" className="block w-full bg-primary text-background font-semibold py-3 px-6 rounded-xl hover:bg-primary/80 transition-colors">
            Create a new account
          </Link>
          <Link to="/login" className="block w-full border border-secondary text-foreground font-medium py-3 px-6 rounded-xl hover:bg-primary/50 transition-colors">
            Already have an account? Log in
          </Link>
        </div>

        <p className="text-dimmed text-sm mt-8">Start your cognitive journey today</p>
        <p className="text-muted text-sm">©Steven Mau Libur Makanya Akhdan Lembur -Hanif</p>
      </div>
    </div>
  )
}