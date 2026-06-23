import ScoreIcon from '../../assets/scoreIcon.svg'

interface TopBarProps {
  username?: string;
  level?: number;
  score?: number;
  onToggleSidebar?: () => void;
}

export function TopBar({
  username = "Player",
  level = 5,
  score = 1250,
  onToggleSidebar,
}: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-surface border-b border-secondary">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:flex hidden flex-col gap-1.5 p-1 rounded hover:bg-secondary/30 transition-colors"
          aria-label="Toggle navigation"
        >
          <span className="block w-5 h-0.5 bg-foreground"></span>
          <span className="block w-5 h-0.5 bg-foreground"></span>
          <span className="block w-5 h-0.5 bg-foreground"></span>
        </button>

        <div className="w-10 h-10 bg-secondary rounded-full border border-[#3D494C] flex items-center justify-center overflow-hidden">
          𒁍
        </div>
        <div>
          <p className="text-foreground font-medium text-sm">{username}</p>
          <p className="text-dimmed text-xs">Level {level}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <span className="text-foreground text-sm font-semibold">{score.toLocaleString()}</span>
          <span className="text-dimmed text-xs">pts</span>
        </div>
        <ScoreIcon className="w-8 h-8 object-contain" />
      </div>
    </header>
  );
}