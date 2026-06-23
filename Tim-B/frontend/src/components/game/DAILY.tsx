import { GameGrid } from "./GameGrid";
import type { CellState } from "./GameGrid";

const dailyGrid: CellState[][] = [
  ["filled", "empty", "empty", "empty", "empty", "empty"],
  ["empty", "filled", "empty", "empty", "empty", "empty"],
  ["empty", "empty", "filled", "empty", "empty", "empty"],
  ["empty", "empty", "empty", "filled", "empty", "empty"],
  ["empty", "empty", "empty", "empty", "filled", "empty"],
  ["empty", "empty", "empty", "empty", "empty", "filled"],
];

export default function DAILY() {
  return <GameGrid initialCells={dailyGrid} />;
}
