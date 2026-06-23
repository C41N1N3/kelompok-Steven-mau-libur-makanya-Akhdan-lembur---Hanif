import { describe, expect, it } from "vitest";

import { getWritingOutline } from "@/features/writing/outline";

describe("writing outline", () => {
  it("provides a trace outline for casual writing practice", () => {
    expect(getWritingOutline("α", "standard")).toEqual({
      target: "α",
      instruction: "Trace the outline for α.",
    });
  });

  it("does not provide an outline for competitive writing practice", () => {
    expect(getWritingOutline("α", "competitive")).toBeNull();
  });

  it("does not provide an outline without a target", () => {
    expect(getWritingOutline(null, "standard")).toBeNull();
  });
});
