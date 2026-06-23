import { GameGrid } from '../components/game/GameGrid';
import type { CellState } from '../components/game/GameGrid';

export default function Game() {
  const handleCellClick = (row: number, col: number, state: CellState) => {
    console.log(`Cell (${row}, ${col}) changed to: ${state}`);
  };

  return (
    <GameGrid onCellClick={handleCellClick} />
  );
}