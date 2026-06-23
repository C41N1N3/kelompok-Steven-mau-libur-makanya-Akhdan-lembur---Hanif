import { describe, expect, it } from "vitest";

import {
  AI_LIMIT_ERROR_MESSAGE,
  getAiUserErrorMessage,
  isAiLimitError,
} from "@/lib/ai/errors";

describe("AI error messages", () => {
  it("detects Gemini quota and free-limit failures", () => {
    expect(isAiLimitError(new Error("Gemini reply failed with status 429."))).toBe(
      true,
    );
    expect(isAiLimitError(new Error("Resource has been exhausted"))).toBe(true);
    expect(isAiLimitError(new Error("quota exceeded for free tier"))).toBe(true);
  });

  it("returns a clear user message when the AI limit is exhausted", () => {
    expect(getAiUserErrorMessage(new Error("status 429"))).toBe(
      "AI free limit or quota has been exhausted. Please try again later.",
    );
    expect(AI_LIMIT_ERROR_MESSAGE).toBe(
      "AI free limit or quota has been exhausted. Please try again later.",
    );
  });

  it("keeps a generic message for non-limit AI failures", () => {
    expect(getAiUserErrorMessage(new Error("network failed"))).toBe(
      "AI response failed. Please try again.",
    );
  });
});
