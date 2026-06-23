import { describe, expect, it } from "vitest";

import { pushStroke, undoStroke } from "@/features/writing/history";

describe("writing history", () => {
  it("pushes and undoes strokes", () => {
    const state = pushStroke([], [{ x: 1, y: 1 }]);
    expect(state).toHaveLength(1);
    expect(undoStroke(state)).toHaveLength(0);
  });
});
