import { SkeletonCard } from './SkeletonCard';

export function SkeletonHome() {
  return (
    <div className="space-y-6">
      <div className="hidden lg:block h-56 bg-surface rounded-xl border border-secondary animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}