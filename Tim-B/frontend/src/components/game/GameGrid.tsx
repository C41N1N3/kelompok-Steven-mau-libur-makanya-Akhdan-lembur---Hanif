import { useState } from 'react';

export type CellState = 'empty' | 'filled' | 'up' | 'down' | 'left' | 'right' | 'diagonal';

interface GameGridProps {
  rows?: number;
  cols?: number;
  initialCells?: CellState[][];
  onCellClick?: (row: number, col: number, state: CellState) => void;
  className?: string;
}

// Default 6x6 grid with some preset states (matching the SVG)
const defaultGrid: CellState[][] = [
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'filled', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'right', 'empty', 'diagonal', 'empty'],
  ['empty', 'empty', 'empty', 'down', 'right', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'filled', 'empty'],
];

export function GameGrid({
  rows = 6,
  cols = 6,
  initialCells = defaultGrid,
  onCellClick,
  className = '',
}: GameGridProps) {
  const [cells, setCells] = useState<CellState[][]>(() => {
    // Ensure the grid has the right dimensions
    const grid = initialCells.map(row => [...row]);
    while (grid.length < rows) {
      grid.push(Array(cols).fill('empty'));
    }
    grid.forEach((row, i) => {
      while (row.length < cols) {
        row.push('empty');
      }
    });
    return grid;
  });

  const handleCellClick = (row: number, col: number) => {
    const current = cells[row][col];
    // Cycle through states: empty → filled → direction → empty
    let next: CellState;
    if (current === 'empty') next = 'filled';
    else if (current === 'filled') next = 'right';
    else if (current === 'right') next = 'down';
    else if (current === 'down') next = 'diagonal';
    else if (current === 'diagonal') next = 'up';
    else if (current === 'up') next = 'left';
    else if (current === 'left') next = 'empty';
    else next = 'empty';

    const newCells = cells.map(r => [...r]);
    newCells[row][col] = next;
    setCells(newCells);
    onCellClick?.(row, col, next);
  };

  // Get the display for a cell state
  const renderCellContent = (state: CellState) => {
    if (state === 'empty') return null;

    const dotColor = '#4CD7F6';
    const dotSize = 8;

    return (
      <svg
        width="40"
        height="40"
        viewBox="0 0 40 40"
        className="absolute inset-0 m-auto pointer-events-none"
      >
        {/* Always show the dot for non-empty states */}
        <circle cx="20" cy="20" r={dotSize} fill={dotColor} />

        {/* Directional indicators */}
        {state === 'right' && (
          <line x1="28" y1="20" x2="36" y2="20" stroke={dotColor} strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'down' && (
          <line x1="20" y1="28" x2="20" y2="36" stroke={dotColor} strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'left' && (
          <line x1="12" y1="20" x2="4" y2="20" stroke={dotColor} strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'up' && (
          <line x1="20" y1="12" x2="20" y2="4" stroke={dotColor} strokeWidth="2" strokeLinecap="round" />
        )}
        {state === 'diagonal' && (
          <line x1="28" y1="12" x2="36" y2="4" stroke={dotColor} strokeWidth="2" strokeLinecap="round" />
        )}
      </svg>
    );
  };

  return (
    <div className={`w-full aspect-square max-w-[540px] mx-auto bg-[#010F1F] rounded-xl border border-[#1C2B3C] p-4 ${className}`}>
      <div
        className="grid gap-2"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          width: '100%',
          height: '100%',
        }}
      >
        {cells.map((row, rowIdx) =>
          row.map((state, colIdx) => {
            const isFilled = state !== 'empty';
            return (
              <button
                key={`${rowIdx}-${colIdx}`}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                className={`
                  relative bg-[#051424] rounded-lg aspect-square
                  border transition-all duration-150
                  ${isFilled
                    ? 'border-primary/80 shadow-[0_0_20px_rgba(76,215,246,0.15)]'
                    : 'border-[#3D494C]/50 hover:border-primary/30'
                  }
                  hover:bg-[#0a1a30] focus:outline-none focus:ring-2 focus:ring-primary/50
                `}
                aria-label={`Cell ${rowIdx + 1}, ${colIdx + 1} – ${state}`}
              >
                {renderCellContent(state)}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}