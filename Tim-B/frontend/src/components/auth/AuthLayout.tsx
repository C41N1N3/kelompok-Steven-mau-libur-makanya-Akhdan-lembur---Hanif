import BrainWaveLogo from '../../assets/brainwave.svg';

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="absolute top-2 left-2">
        <button onClick={() => window.location.href = '/'} className="p-1">
          <p className="text-sm text-dimmed"> ← Back to Landing Page </p>
        </button>
      </div>
      
      <div className="max-w-md w-full p-8">

        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-secondary rounded-xl border border-[#3D494C] flex items-center justify-center">
            <BrainWaveLogo className="w-16 h-16" />
          </div>
        </div>

        <h1 className="font-space-grotesk text-3xl text-foreground text-center font-semibold">
          {title}
        </h1>
        <p className="text-dimmed text-center mt-1 text-sm">{subtitle}</p>

        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}