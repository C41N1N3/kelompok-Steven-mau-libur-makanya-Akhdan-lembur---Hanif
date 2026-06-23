import { useState } from 'react'
import { Link } from 'react-router-dom'
import toast from "react-hot-toast";
import { AuthTabs } from './AuthTabs'
import { ConfirmationDialog } from '../shared/ConfirmationDialog'

export default function RegisterForm() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault()
    console.log('Register:', { email, password, confirmPassword })
    toast.success('Account created successfully!');
    window.location.href = '/home';
  }

  return (
    <div className="rounded-xl shadow-2xl p-8 bg-surface">
      <AuthTabs active="register" />

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="block text-foreground text-sm font-medium mb-1.5"> Email </label>
          <input id="email" type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted" placeholder="Choose a username" />
        </div>

        <div>
          <label htmlFor="username" className="block text-foreground text-sm font-medium mb-1.5"> Username </label>
          <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted" placeholder="Choose a username" />
        </div>

        <div>
          <label htmlFor="password" className="block text-foreground text-sm font-medium mb-1.5"> Password </label>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted" placeholder="Create a password"/>
          <p className="text-muted text-xs mt-1"> (Enter at least 8 characters containing numbers, letters, and special characters)</p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-foreground text-sm font-medium mb-1.5"> Confirm Password </label>
          <input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-background text-foreground border border-secondary rounded-lg px-4 py-2.5 focus:outline-none focus:border-primary transition-colors placeholder:text-muted" placeholder="Confirm your password"/>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-background font-semibold py-3 rounded-xl hover:bg-primary/80 transition-colors mt-2"
          onClick={() => setIsRegisterModalOpen(true)}
        >
          Create Account
        </button>

        <p className="text-center text-dimmed text-sm mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Log in
          </Link>
        </p>

        <ConfirmationDialog
          isOpen={isRegisterModalOpen}
          onClose={() => setIsRegisterModalOpen(false)}
          onConfirm={() => { window.location.href = '/home'; }}
          title="Register"
          description="Are you sure you want to register for BrainWave?"
          confirmText="Register"
          cancelText="Cancel"
          confirmVariant="primary"
        />
      </form>
    </div>
  )
}