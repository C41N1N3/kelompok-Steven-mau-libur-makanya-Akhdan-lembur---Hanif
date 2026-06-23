export function SkeletonCard() {
  return (
    <div className="bg-surface rounded-xl border border-secondary p-6 animate-pulse">
      <div className="h-12 w-12 bg-secondary rounded-full mx-auto mb-3" />
      <div className="h-4 bg-secondary rounded w-3/4 mx-auto mb-2" />
      <div className="h-3 bg-secondary rounded w-1/2 mx-auto" />
    </div>
  );
}