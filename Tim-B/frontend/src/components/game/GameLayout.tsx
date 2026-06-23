import { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmationDialog } from '../shared/ConfirmationDialog';
import { Modal } from '../shared/Modal';
import { Slider } from '../shared/Slider';
import ScoreIcon from '../../assets/scoreIcon.svg';
import { PageTransition } from '../shared/PageTransition';
import { SkeletonGame } from '../shared/skeletons/SkeletonGame';
import { showToast } from '../../utils/toast';

interface GameLayoutProps {
  username?: string;
  level?: number;
  score?: number;
}

export function GameLayout({
  username = 'Player',
  level = 5,
  score = 1250,
}: GameLayoutProps) {
  const navigate = useNavigate();
  const [isExitModalOpen, setIsExitModalOpen] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Volume states (in‑game settings)
  const [masterVolume, setMasterVolume] = useState(75);
  const [bgmVolume, setBgmVolume] = useState(50);
  const [sfxVolume, setSfxVolume] = useState(65);

  useEffect(() => {
    const timer_load = setTimeout(() => setIsLoading(false), 500);
    return () => {
      clearTimeout(timer_load);
    };
  }, []);

  if (isLoading) return <SkeletonGame />;
  
  const handleExit = () => {
    setIsExitModalOpen(false);
    showToast.success('See you soon!');
    navigate('/home');
  };

  const handleHint = () => {
    setIsHintModalOpen(false);
    console.log('Showing hint...');
    toast.success('Hint: Look for patterns in the grid!');
  };

  const handleSaveSettings = () => {
    // Save settings (e.g., to context or local storage)
    console.log('Settings saved:', { masterVolume, bgmVolume, sfxVolume });
    setIsSettingsModalOpen(false);
    showToast.success('Settings saved!');
  };

  return (
    <PageTransition>
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-surface">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsExitModalOpen(true)}
            className="text-dimmed hover:text-foreground transition-colors text-sm font-medium"
            aria-label="Exit game"
          >
            ✕ Exit
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-secondary rounded-full border border-[#3D494C] flex items-center justify-center overflow-hidden text-lg">
            𒁍
          </div>
          <div className="hidden sm:block">
            <p className="text-foreground font-medium text-sm">{username}</p>
            <p className="text-dimmed text-xs">Level {level}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-foreground text-sm font-semibold">{score.toLocaleString()}</span>
            <span className="text-dimmed text-xs">pts</span>
          </div>
          <ScoreIcon className="w-7 h-7 object-contain" />
        </div>
      </header>

      {/* Game Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>

      {/* Bottom Bar */}
      <div className="flex items-center justify-center gap-6 px-4 py-4 border-t border-[#3D494C] my-8">
        <button
          onClick={() => setIsExitModalOpen(true)}
          className="text-dimmed hover:text-error transition-colors flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border"
        >
          Exit
        </button>

        <button
          onClick={() => setIsHintModalOpen(true)}
          className="text-dimmed hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border"
        >
          Hint
        </button>

        <button
          onClick={() => setIsSettingsModalOpen(true)}
          className="text-dimmed hover:text-primary transition-colors flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl border"
        >
          Settings
        </button>
      </div>

      {/* Dialogs */}
      <ConfirmationDialog
        isOpen={isExitModalOpen}
        onClose={() => setIsExitModalOpen(false)}
        onConfirm={handleExit}
        title="Exit Game"
        description="Are you sure you want to exit? Your progress will be lost."
        confirmText="Exit"
        cancelText="Stay"
        confirmVariant="danger"
      />

      <ConfirmationDialog
        isOpen={isHintModalOpen}
        onClose={() => setIsHintModalOpen(false)}
        onConfirm={handleHint}
        title="Hint"
        description="Would you like a hint for this puzzle?"
        confirmText="Show Hint"
        cancelText="No Thanks"
        confirmVariant="primary"
      />

      {/* Settings Modal – now using the generic Modal */}
      <Modal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        title="Game Settings"
        footer={
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsSettingsModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-secondary text-foreground hover:bg-secondary/30 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/80 text-background font-medium transition-colors text-sm"
            >
              Save
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Master Volume
            </label>
            <Slider value={masterVolume} onChange={setMasterVolume} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              BGM
            </label>
            <Slider value={bgmVolume} onChange={setBgmVolume} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              SFX
            </label>
            <Slider value={sfxVolume} onChange={setSfxVolume} />
          </div>
        </div>
      </Modal>
    </div>
    </PageTransition>
  );
}