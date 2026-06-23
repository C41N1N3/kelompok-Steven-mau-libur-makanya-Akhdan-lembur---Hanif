import { GameGrid } from './GameGrid';
import type { CellState } from './GameGrid';

const ningGrid: CellState[][] = [
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'right', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'down', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
];

export default function NING() {
  return <GameGrid initialCells={ningGrid} />;
}