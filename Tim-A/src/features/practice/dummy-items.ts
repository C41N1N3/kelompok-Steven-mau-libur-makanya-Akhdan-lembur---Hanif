import type { PracticeMode } from "@/features/difficulty/rules";
import type { PracticeItem } from "@/server/queries/practice";

const WRITING_DUMMY_TARGETS: Record<string, Array<{ prompt: string; greek: string }>> = {
  "at-the-cafe": [
    { prompt: "Write the Greek word for coffee.", greek: "καφές" },
    { prompt: "Write the Greek word for water.", greek: "νερό" },
    { prompt: "Write the Greek word for tea.", greek: "τσάι" },
    { prompt: "Write the Greek word for bread.", greek: "ψωμί" },
    { prompt: "Write the Greek word for milk.", greek: "γάλα" },
  ],
  "city-directions": [
    { prompt: "Write the Greek word for square.", greek: "πλατεία" },
    { prompt: "Write the Greek word for street.", greek: "δρόμος" },
    { prompt: "Write the Greek word for left.", greek: "αριστερά" },
    { prompt: "Write the Greek word for right.", greek: "δεξιά" },
    { prompt: "Write the Greek word for school.", greek: "σχολείο" },
  ],
  "family-introductions": [
    { prompt: "Write the Greek word for family.", greek: "οικογένεια" },
    { prompt: "Write the Greek word for mother.", greek: "μητέρα" },
    { prompt: "Write the Greek word for father.", greek: "πατέρας" },
    { prompt: "Write the Greek word for sister.", greek: "αδελφή" },
    { prompt: "Write the Greek word for brother.", greek: "αδελφός" },
  ],
  "market-shopping": [
    { prompt: "Write the Greek word for apple.", greek: "μήλο" },
    { prompt: "Write the Greek word for price.", greek: "τιμή" },
    { prompt: "Write the Greek word for fish.", greek: "ψάρι" },
    { prompt: "Write the Greek word for bag.", greek: "τσάντα" },
    { prompt: "Write the Greek word for cheese.", greek: "τυρί" },
  ],
};

const DEFAULT_WRITING_TARGETS = [
  { prompt: "Write the Greek letter alpha.", greek: "α" },
  { prompt: "Write the Greek letter beta.", greek: "β" },
  { prompt: "Write the Greek word for hello.", greek: "γεια" },
  { prompt: "Write the Greek word for yes.", greek: "ναι" },
  { prompt: "Write the Greek word for please.", greek: "παρακαλώ" },
];

export function ensurePracticeItemsForMode(
  lessonId: string,
  mode: PracticeMode,
  items: PracticeItem[],
): PracticeItem[] {
  if (mode !== "writing" || items.length >= 5) return items;

  const existingGreek = new Set(items.map((item) => item.greek).filter(Boolean));
  const targets = WRITING_DUMMY_TARGETS[lessonId] ?? DEFAULT_WRITING_TARGETS;
  const dummyItems = targets
    .filter((target) => !existingGreek.has(target.greek))
    .map((target, index) => createWritingDummyItem(lessonId, target, items.length + index + 1));

  return [...items, ...dummyItems].slice(0, 5);
}

export function getPersistedLessonItemId(id: string | undefined): string | undefined {
  if (!id || id.includes("-writing-dummy-")) return undefined;
  return id;
}

function createWritingDummyItem(
  lessonId: string,
  target: { prompt: string; greek: string },
  orderIndex: number,
): PracticeItem {
  return {
    id: `${lessonId}-writing-dummy-${orderIndex}`,
    kind: "writing",
    prompt: target.prompt,
    greek: target.greek,
    options: [],
    answer: target.greek,
    scenario_goals: [],
    order_index: orderIndex,
  };
}
