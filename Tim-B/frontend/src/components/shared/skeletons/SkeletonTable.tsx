export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="animate-pulse">
      <div className="h-10 bg-secondary/20 rounded mb-2" /> {/* header */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4 py-2 border-b border-secondary/30">
          {Array.from({ length: cols }).map((_, j) => (
            <div key={j} className="h-4 bg-secondary rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}