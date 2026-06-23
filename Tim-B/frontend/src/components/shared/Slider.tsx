import { } from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  className = '',
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={`relative w-full h-2 bg-secondary rounded-full ${className}`}>
      {/* Filled track */}
      <div
        className="absolute top-0 left-0 h-full bg-primary rounded-full"
        style={{ width: `${percentage}%` }}
      />
      {/* Hidden native input for accessibility and events */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Slider"
      />
      {/* Custom thumb */}
      <div
        className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-primary rounded-full border-2 border-background pointer-events-none"
        style={{ left: `calc(${percentage}% - 8px)` }}
      />
    </div>
  );
}