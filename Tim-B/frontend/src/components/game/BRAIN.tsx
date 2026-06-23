import { GameGrid } from './GameGrid';
import type { CellState } from './GameGrid';

const brainGrid: CellState[][] = [
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'filled', 'empty', 'filled', 'empty'],
  ['empty', 'empty', 'right', 'empty', 'diagonal', 'empty'],
  ['empty', 'empty', 'empty', 'down', 'right', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'filled', 'empty'],
];

export default function BRAIN() {
  return <GameGrid initialCells={brainGrid} />;
}