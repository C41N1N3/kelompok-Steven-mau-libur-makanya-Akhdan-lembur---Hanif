import { describe, expect, it } from "vitest";

import {
  ensurePracticeItemsForMode,
  getPersistedLessonItemId,
} from "@/features/practice/dummy-items";
import type { PracticeItem } from "@/server/queries/practice";

const coffeeItem: PracticeItem = {
  id: "coffee",
  kind: "writing",
  prompt: "Write the Greek word for coffee.",
  greek: "καφές",
  options: [],
  answer: "καφές",
  scenario_goals: [],
  order_index: 1,
};

describe("practice dummy items", () => {
  it("fills writing practice to 5 different questions", () => {
    const items = ensurePracticeItemsForMode("at-the-cafe", "writing", [
      coffeeItem,
    ]);

    expect(items).toHaveLength(5);
    expect(new Set(items.map((item) => item.greek)).size).toBe(5);
    expect(items.map((item) => item.prompt)).toEqual([
      "Write the Greek word for coffee.",
      "Write the Greek word for water.",
      "Write the Greek word for tea.",
      "Write the Greek word for bread.",
      "Write the Greek word for milk.",
    ]);
  });

  it("does not add dummy items for non-writing practice", () => {
    expect(
      ensurePracticeItemsForMode("at-the-cafe", "vocabulary", []),
    ).toHaveLength(0);
  });

  it("does not persist dummy item ids as lesson item foreign keys", () => {
    expect(getPersistedLessonItemId("at-the-cafe-writing-dummy-2")).toBeUndefined();
    expect(
      getPersistedLessonItemId("8b289e22-b1c9-43a5-8fc0-c08bb42c7e4d"),
    ).toBe("8b289e22-b1c9-43a5-8fc0-c08bb42c7e4d");
  });
});
