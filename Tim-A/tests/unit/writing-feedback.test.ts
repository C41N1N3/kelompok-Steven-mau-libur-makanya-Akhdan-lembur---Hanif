import { describe, expect, it } from "vitest";

import {
  canAdvanceWritingQuestion,
  evaluateWritingSubmission,
} from "@/features/writing/feedback";

describe("writing feedback", () => {
  it("marks drawings centered on the outline as correct", () => {
    const snapshot = JSON.stringify([
      [
        { x: 408, y: 160 },
        { x: 408, y: 230 },
        { x: 408, y: 300 },
        { x: 408, y: 360 },
        { x: 470, y: 190 },
        { x: 500, y: 230 },
        { x: 470, y: 270 },
        { x: 510, y: 310 },
        { x: 480, y: 350 },
      ],
    ]);

    expect(evaluateWritingSubmission(snapshot, "\u03b2")).toMatchObject({
      isCorrect: true,
      title: "Correct",
    });
  });

  it("accepts reasonable non-exact tracing around the outline", () => {
    const snapshot = JSON.stringify([
      [
        { x: 390, y: 145 },
        { x: 402, y: 205 },
        { x: 415, y: 285 },
        { x: 425, y: 365 },
      ],
      [
        { x: 455, y: 170 },
        { x: 525, y: 205 },
        { x: 500, y: 255 },
        { x: 455, y: 270 },
      ],
      [
        { x: 462, y: 282 },
        { x: 535, y: 320 },
        { x: 488, y: 372 },
        { x: 430, y: 350 },
      ],
    ]);

    expect(evaluateWritingSubmission(snapshot, "\u03b2")).toMatchObject({
      isCorrect: true,
      title: "Correct",
    });
  });

  it("accepts matching shape drawn away from the outline", () => {
    const snapshot = JSON.stringify([
      [
        { x: 110, y: 65 },
        { x: 120, y: 125 },
        { x: 132, y: 205 },
        { x: 142, y: 285 },
      ],
      [
        { x: 165, y: 90 },
        { x: 235, y: 125 },
        { x: 210, y: 175 },
        { x: 165, y: 190 },
      ],
      [
        { x: 172, y: 202 },
        { x: 245, y: 240 },
        { x: 198, y: 292 },
        { x: 140, y: 270 },
      ],
    ]);

    expect(evaluateWritingSubmission(snapshot, "\u03b2")).toMatchObject({
      isCorrect: true,
      title: "Correct",
    });
  });

  it("marks partial centered strokes as incorrect", () => {
    const snapshot = JSON.stringify([
      [
        { x: 430, y: 170 },
        { x: 435, y: 220 },
        { x: 440, y: 270 },
        { x: 445, y: 320 },
        { x: 450, y: 360 },
        { x: 455, y: 365 },
      ],
    ]);

    expect(evaluateWritingSubmission(snapshot, "\u03b2")).toMatchObject({
      isCorrect: false,
      title: "Needs practice",
    });
  });

  it("marks tiny drawings as incorrect", () => {
    const snapshot = JSON.stringify([[{ x: 1, y: 1 }]]);

    expect(evaluateWritingSubmission(snapshot, "please")).toMatchObject({
      isCorrect: false,
      title: "Needs practice",
    });
  });

  it("marks large drawings away from the outline as incorrect", () => {
    const snapshot = JSON.stringify([
      [
        { x: 300, y: 360 },
        { x: 305, y: 260 },
        { x: 360, y: 150 },
        { x: 470, y: 90 },
        { x: 600, y: 100 },
        { x: 700, y: 170 },
      ],
    ]);

    expect(evaluateWritingSubmission(snapshot, "\u03b2")).toMatchObject({
      isCorrect: false,
      title: "Needs practice",
    });
  });

  it("blocks casual progress when feedback needs practice", () => {
    expect(
      canAdvanceWritingQuestion({ isCorrect: false }, "standard"),
    ).toBe(false);
  });

  it("allows competitive progress after one try even when incorrect", () => {
    expect(
      canAdvanceWritingQuestion({ isCorrect: false }, "competitive"),
    ).toBe(true);
  });
});
