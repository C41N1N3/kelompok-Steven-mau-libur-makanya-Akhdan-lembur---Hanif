import type { Difficulty } from "@/features/difficulty/rules";

type WritingOutline = {
  target: string;
  instruction: string;
};

export function getWritingOutline(
  target: string | null | undefined,
  difficulty: Difficulty,
): WritingOutline | null {
  if (difficulty !== "standard" || !target) return null;

  return {
    target,
    instruction: `Trace the outline for ${target}.`,
  };
}
