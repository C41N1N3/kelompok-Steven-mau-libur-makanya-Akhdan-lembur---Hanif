import { GameGrid } from './GameGrid';
import type { CellState } from './GameGrid';

const cubeGrid: CellState[][] = [
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'filled', 'empty', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'filled', 'empty', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'filled', 'empty', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'filled', 'empty'],
  ['empty', 'empty', 'empty', 'empty', 'empty', 'empty'],
];

export default function CUBE() {
  return <GameGrid initialCells={cubeGrid} />;
}