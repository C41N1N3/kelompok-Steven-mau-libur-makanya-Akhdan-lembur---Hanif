import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ConfirmationDialog } from '../components/shared/ConfirmationDialog.tsx';
import { PageTransition } from '../components/shared/PageTransition';
import { SkeletonHome } from '../components/shared/skeletons/SkeletonHome';

const gamemodes = [
  {
    id: 1,
    title: 'Classic',
    description: 'Standard puzzle sets.',
    icon: 'C U B E',
    color: 'text-primary',
  },
  {
    id: 2,
    title: 'Challenge',
    description: 'Time-attack scenarios.',
    icon: 'N I N G',
    color: 'text-primary',
  },
  {
    id: 3,
    title: 'Multiplayer',
    description: 'Competitive logic.',
    icon: 'M U L T I',
    color: 'text-primary',
  },
  {
    id: 4,
    title: 'Brain Teaser',
    description: 'Test your logic with tricky puzzles.',
    icon: 'B R A I N',
    color: 'text-primary',
  },
  {
    id: 5,
    title: 'Daily Challenge',
    description: 'Solve puzzles daily for a chance to win.',
    icon: 'D A I L Y',
    color: 'text-primary',
  }
];

const slides = [
  {
    id: 1,
    title: 'New Gamemode: Brain Teaser!',
    description: 'Challenge your logic with tricky puzzles.',
    color: 'from-primary/20 to-primary/5',
  },
  {
    id: 2,
    title: 'Daily Challenge Active!',
    description: 'Earn double points today.',
    color: 'from-warning/20 to-warning/5',
  },
  {
    id: 3,
    title: 'Community Leaderboard',
    description: 'Compete with friends and climb the ranks.',
    color: 'from-accent/20 to-accent/5',
  },
];

export default function Home() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlayingModalOpen, setIsPlayingModalOpen] = useState(false);
  const [selectedMode, setSelectedMode] = useState<(typeof gamemodes)[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer_load = setTimeout(() => setIsLoading(false), 500);
    const timer_slide = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => {
      clearTimeout(timer_load);
      clearInterval(timer_slide);
    };
  }, []);

  if (isLoading) return <SkeletonHome />;

  const handlePlayClick = (mode: (typeof gamemodes)[0]) => {
    setSelectedMode(mode);
    setIsPlayingModalOpen(true);
  };

  const handleConfirmPlay = () => {
    setIsPlayingModalOpen(false);
    if (!selectedMode) return;

    const toastId = toast.loading('Loading game...');

    const routeMap: Record<string, string> = {
      'Classic': '/game/cube',
      'Challenge': '/game/ning',
      'Multiplayer': '/game/multi',
      'Brain Teaser': '/game/brain',
      'Daily Challenge': '/game/daily',
    };
    const path = routeMap[selectedMode.title] || '/game';
    
    setTimeout(() => {
      toast.dismiss(toastId);
      navigate(path);
    }, 500);
  };

  return (
    <PageTransition>
    <div className="space-y-6 lg:space-y-8">
      {/* Carousel – unchanged */}
      <div className="hidden lg:block">
        <div className="relative w-full h-56 overflow-hidden rounded-xl bg-surface border border-secondary">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              className={`absolute inset-0 p-8 transition-opacity duration-700 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              } bg-gradient-to-br ${slide.color}`}
            >
              <div className="flex flex-col justify-center h-full">
                <h3 className="text-2xl font-semibold text-foreground">{slide.title}</h3>
                <p className="text-dimmed mt-2 text-lg">{slide.description}</p>
                <div className="flex gap-2 mt-4">
                  <span className="inline-block bg-primary/20 text-primary text-sm px-3 py-1 rounded-full">
                    New
                  </span>
                  <span className="inline-block bg-secondary/50 text-dimmed text-sm px-3 py-1 rounded-full">
                    Play Now
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentSlide
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-secondary hover:bg-secondary/60'
                }`}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Gamemodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {gamemodes.map((mode) => (
          <GamemodeCard
            key={mode.id}
            mode={mode}
            onPlayClick={() => handlePlayClick(mode)}
          />
        ))}
      </div>

      <ConfirmationDialog
        isOpen={isPlayingModalOpen}
        onClose={() => setIsPlayingModalOpen(false)}
        onConfirm={handleConfirmPlay}
        title={`Start ${selectedMode?.title || 'Game'}`}
        description={`Are you sure you want to start a new game of "${selectedMode?.title || 'BrainWave'}"? (±15 minutes)`}
        confirmText="Start"
        cancelText="Cancel"
        confirmVariant="primary"
      />
      </div>
      </PageTransition>
  );
}

interface GamemodeCardProps {
  mode: {
    id: number;
    title: string;
    description: string;
    icon: string;
    color: string;
  };
  onPlayClick: () => void;
}

function GamemodeCard({ mode, onPlayClick }: GamemodeCardProps) {
  return (
    <div className="group bg-surface rounded-xl border border-secondary p-6 hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex flex-col items-center text-center">
        <div className="text-4xl mb-3">{mode.icon}</div>
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {mode.title}
        </h3>
        <p className="text-dimmed text-sm mt-1">{mode.description}</p>
        <button
          className="mt-4 w-full bg-secondary hover:bg-primary/20 text-foreground hover:text-primary font-medium py-2 px-4 rounded-lg transition-all duration-200 border border-secondary hover:border-primary/30"
          onClick={onPlayClick}
        >
          Play
        </button>
      </div>
    </div>
  );
}