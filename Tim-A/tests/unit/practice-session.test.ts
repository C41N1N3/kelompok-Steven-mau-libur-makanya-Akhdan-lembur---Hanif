import { describe, expect, it } from "vitest";

import { nextProgressValue } from "@/features/practice/progress";

describe("practice progress", () => {
  it("calculates progress percentage", () => {
    expect(nextProgressValue(2, 10)).toBe(20);
  });

  it("handles empty sessions", () => {
    expect(nextProgressValue(0, 0)).toBe(0);
  });
});
