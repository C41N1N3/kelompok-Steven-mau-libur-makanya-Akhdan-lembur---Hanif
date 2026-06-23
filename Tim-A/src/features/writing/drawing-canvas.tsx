"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RotateCcw, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  pushStroke,
  undoStroke,
  type Point,
  type Stroke,
} from "@/features/writing/history";

type Props = {
  guideText?: string | null;
  onChange?: (hasDrawing: boolean) => void;
  onSnapshotChange?: (snapshot: string) => void;
};

export function DrawingCanvas({ guideText, onChange, onSnapshotChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [activeStroke, setActiveStroke] = useState<Stroke>([]);

  useEffect(() => {
    onChange?.(strokes.length > 0 || activeStroke.length > 0);
    onSnapshotChange?.(JSON.stringify(strokes));
  }, [activeStroke.length, onChange, onSnapshotChange, strokes]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawGuide(context, canvas.width, canvas.height);
    drawTextOutline(context, canvas.width, canvas.height, guideText);
    [...strokes, activeStroke].forEach((stroke) => drawStroke(context, stroke));
  }, [activeStroke, guideText, strokes]);

  useEffect(() => {
    redraw();
  }, [redraw]);

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>): Point {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function startStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    setActiveStroke([getCanvasPoint(event)]);
  }

  function continueStroke(event: React.PointerEvent<HTMLCanvasElement>) {
    event.preventDefault();
    if (activeStroke.length === 0) return;
    const point = getCanvasPoint(event);
    setActiveStroke((stroke) => [...stroke, point]);
  }

  function finishStroke(event?: React.PointerEvent<HTMLCanvasElement>) {
    event?.preventDefault();
    if (activeStroke.length === 0) return;
    setStrokes((current) => pushStroke(current, activeStroke));
    setActiveStroke([]);
  }

  function undo() {
    setStrokes((current) => undoStroke(current));
  }

  function clear() {
    setStrokes([]);
    setActiveStroke([]);
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-lg border bg-background">
        <canvas
          ref={canvasRef}
          width={900}
          height={520}
          className="block aspect-[9/5] w-full touch-none cursor-crosshair bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:48px_48px]"
          aria-label="Greek writing practice canvas"
          onPointerDown={startStroke}
          onPointerMove={continueStroke}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onPointerLeave={finishStroke}
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={undo}
          disabled={strokes.length === 0}
        >
          <RotateCcw className="size-4" />
          Undo
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={clear}
          disabled={strokes.length === 0 && activeStroke.length === 0}
        >
          <Trash2 className="size-4" />
          Clear
        </Button>
      </div>
    </div>
  );
}

function drawTextOutline(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  guideText?: string | null,
) {
  if (!guideText) return;

  context.save();
  context.font = `700 ${Math.min(220, width / Math.max(2.6, guideText.length * 0.72))}px serif`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.lineWidth = 4;
  context.strokeStyle = "rgba(151, 108, 47, 0.28)";
  context.fillStyle = "rgba(151, 108, 47, 0.08)";
  context.strokeText(guideText, width / 2, height / 2);
  context.fillText(guideText, width / 2, height / 2);
  context.restore();
}

function drawGuide(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.save();
  context.strokeStyle = "rgba(245, 158, 11, 0.22)";
  context.lineWidth = 2;
  context.setLineDash([12, 12]);
  context.beginPath();
  context.moveTo(width * 0.12, height * 0.5);
  context.lineTo(width * 0.88, height * 0.5);
  context.stroke();
  context.restore();
}

function drawStroke(context: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.length === 0) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = "rgb(24, 24, 27)";
  context.lineWidth = 10;

  if (stroke.length === 1) {
    context.beginPath();
    context.arc(stroke[0].x, stroke[0].y, context.lineWidth / 2, 0, Math.PI * 2);
    context.fillStyle = context.strokeStyle;
    context.fill();
    context.restore();
    return;
  }

  context.beginPath();
  context.moveTo(stroke[0].x, stroke[0].y);
  stroke.slice(1).forEach((point) => context.lineTo(point.x, point.y));
  context.stroke();
  context.restore();
}
