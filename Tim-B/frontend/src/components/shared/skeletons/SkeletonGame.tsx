export function SkeletonGame() {
  return (
    <div className="w-full aspect-square max-w-135 mx-auto bg-[#010F1F] rounded-xl border border-[#1C2B3C] p-4 animate-pulse">
      <div className="grid grid-cols-6 gap-2 w-full h-full">
        {Array.from({ length: 36 }).map((_, i) => (
          <div
            key={i}
            className="bg-background rounded-lg border border-[#3D494C]/30"
          />
        ))}
      </div>
    </div>
  );
}
