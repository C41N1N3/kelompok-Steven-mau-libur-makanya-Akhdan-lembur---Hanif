import { SkeletonTable } from './SkeletonTable';

export function SkeletonLeaderboard() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="h-6 bg-secondary rounded w-32 animate-pulse" />
        <div className="h-10 bg-secondary rounded w-48 animate-pulse" />
      </div>
      <SkeletonTable rows={8} cols={4} />
    </div>
  );
}