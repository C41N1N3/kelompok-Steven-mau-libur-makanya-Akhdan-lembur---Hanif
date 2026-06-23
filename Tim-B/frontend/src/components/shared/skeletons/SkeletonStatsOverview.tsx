import { SkeletonCard } from './SkeletonCard';

export function SkeletonStatsOverview() {
  return (
    <div className="space-y-6">
      <div className="bg-surface rounded-xl border border-secondary p-6 animate-pulse">
        <div className="h-64 bg-secondary rounded" /> {/* chart placeholder */}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
}