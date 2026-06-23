export type Point = { x: number; y: number };
export type Stroke = Point[];

export function pushStroke(strokes: Stroke[], stroke: Stroke): Stroke[] {
  return [...strokes, stroke];
}

export function undoStroke(strokes: Stroke[]): Stroke[] {
  return strokes.slice(0, -1);
}
