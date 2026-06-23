import type { Difficulty } from "@/features/difficulty/rules";

type WritingFeedback = {
  isCorrect: boolean;
  title: "Correct" | "Needs practice";
  message: string;
};

type Point = { x: number; y: number };

export function evaluateWritingSubmission(
  snapshot: string,
  target: string | null | undefined,
): WritingFeedback {
  const points = parseDrawingPoints(snapshot);
  const pointCount = points.length;
  const targetLength = Math.max(1, target?.length ?? 1);
  const requiredPoints = Math.max(8, Math.min(24, targetLength * 3));
  const bounds = getBounds(points);
  const coverage = bounds ? getCoverage(points, bounds) : null;
  const features = bounds ? getNormalizedFeatures(points, bounds) : null;
  const isCorrect =
    pointCount >= requiredPoints &&
    bounds !== null &&
    coverage !== null &&
    features !== null &&
    hasReasonableShape(bounds, targetLength) &&
    coverage.horizontalBands >= (targetLength === 1 ? 2 : 3) &&
    coverage.verticalBands >= 3 &&
    matchesTargetShape(features, target);

  if (isCorrect) {
    return {
      isCorrect: true,
      title: "Correct",
      message: "Writing feedback: your stroke pattern matches the target shape.",
    };
  }

  return {
    isCorrect: false,
    title: "Needs practice",
    message: "Writing feedback: match the target stroke pattern more closely.",
  };
}

export function canAdvanceWritingQuestion(
  feedback: Pick<WritingFeedback, "isCorrect">,
  difficulty: Difficulty,
): boolean {
  return difficulty === "competitive" || feedback.isCorrect;
}

function parseDrawingPoints(snapshot: string): Point[] {
  try {
    const strokes = JSON.parse(snapshot) as unknown;
    if (!Array.isArray(strokes)) return [];

    return strokes.flatMap((stroke) => {
      if (!Array.isArray(stroke)) return [];
      return stroke.filter(isPoint);
    });
  } catch {
    return [];
  }
}

function getBounds(points: Point[]): {
  width: number;
  height: number;
  centerX: number;
  centerY: number;
} | null {
  if (points.length === 0) return null;

  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    width: maxX - minX,
    height: maxY - minY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
}

function getCoverage(points: Point[], bounds: NonNullable<ReturnType<typeof getBounds>>) {
  const horizontalBands = new Set<number>();
  const verticalBands = new Set<number>();

  points.forEach((point) => {
    const xRatio = bounds.width === 0 ? 0.5 : (point.x - (bounds.centerX - bounds.width / 2)) / bounds.width;
    const yRatio = bounds.height === 0 ? 0.5 : (point.y - (bounds.centerY - bounds.height / 2)) / bounds.height;
    horizontalBands.add(toBand(xRatio));
    verticalBands.add(toBand(yRatio));
  });

  return {
    horizontalBands: horizontalBands.size,
    verticalBands: verticalBands.size,
  };
}

function getNormalizedFeatures(
  points: Point[],
  bounds: NonNullable<ReturnType<typeof getBounds>>,
) {
  const normalized = points.map((point) => ({
    x: bounds.width === 0 ? 0.5 : (point.x - (bounds.centerX - bounds.width / 2)) / bounds.width,
    y: bounds.height === 0 ? 0.5 : (point.y - (bounds.centerY - bounds.height / 2)) / bounds.height,
  }));

  return {
    leftStemCoverage: verticalCoverage(
      normalized.filter((point) => point.x <= 0.35),
    ),
    upperRightCoverage: normalized.filter(
      (point) => point.x >= 0.45 && point.y <= 0.55,
    ).length,
    lowerRightCoverage: normalized.filter(
      (point) => point.x >= 0.45 && point.y >= 0.45,
    ).length,
    middleCoverage: normalized.filter(
      (point) => point.y >= 0.35 && point.y <= 0.7,
    ).length,
    rightReach: Math.max(...normalized.map((point) => point.x)),
    leftReach: Math.min(...normalized.map((point) => point.x)),
  };
}

function hasReasonableShape(
  bounds: NonNullable<ReturnType<typeof getBounds>>,
  targetLength: number,
): boolean {
  const aspectRatio = bounds.width / Math.max(1, bounds.height);
  const minWidth = targetLength === 1 ? 45 : 80;
  const minHeight = targetLength === 1 ? 110 : 70;
  const maxAspectRatio = targetLength === 1 ? 1.35 : 8;

  return (
    bounds.width >= minWidth &&
    bounds.height >= minHeight &&
    aspectRatio <= maxAspectRatio
  );
}

function matchesTargetShape(
  features: NonNullable<ReturnType<typeof getNormalizedFeatures>>,
  target: string | null | undefined,
): boolean {
  const normalizedTarget = (target ?? "").trim().toLowerCase();

  if (normalizedTarget === "\u03b2" || normalizedTarget === "beta") {
    return (
      features.leftStemCoverage >= 0.62 &&
      features.upperRightCoverage >= 2 &&
      features.lowerRightCoverage >= 2 &&
      features.middleCoverage >= 2 &&
      features.rightReach >= 0.82 &&
      features.leftReach <= 0.2
    );
  }

  return features.middleCoverage >= 2;
}

function verticalCoverage(points: Array<{ y: number }>): number {
  if (points.length === 0) return 0;
  const ys = points.map((point) => point.y);
  return Math.max(...ys) - Math.min(...ys);
}

function toBand(ratio: number): number {
  return Math.max(0, Math.min(2, Math.floor(ratio * 3)));
}

function isPoint(value: unknown): value is Point {
  if (!value || typeof value !== "object") return false;
  return "x" in value && "y" in value;
}
