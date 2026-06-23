import { describe, expect, it } from "vitest";

import { replyToConversation } from "@/lib/ai/reply-conversation";
import { replyToConversationWithGemini } from "@/lib/ai/providers/gemini";
import { replyToConversationWithMock } from "@/lib/ai/providers/mock";

describe("mock conversation replier", () => {
  it("returns Greek-first assistant text with a short English hint", async () => {
    const reply = await replyToConversationWithMock({
      difficulty: "standard",
      scenario: "Greet the waiter at a cafe.",
      scenarioGoals: ["greet politely", "order a drink"],
      messages: [
        { role: "assistant", text: "Καλημέρα! Τι θα πάρετε;" },
        { role: "user", text: "Καλημέρα. Θέλω νερό." },
      ],
    });

    expect(reply.text).toContain("Θα θέλατε");
    expect(reply.englishHint).toBe("Ask for one more item or say thank you.");
  });
});

describe("conversation replier provider selection", () => {
  it("uses Gemini when AI_PROVIDER is gemini", async () => {
    const reply = await replyToConversation(
      {
        difficulty: "competitive",
        scenario: "Greet the waiter at a cafe.",
        scenarioGoals: ["greet politely"],
        messages: [{ role: "user", text: "Καλημέρα." }],
      },
      {
        provider: "gemini",
        geminiApiKey: "test-key",
        generateGeminiContent: async () => ({
          text: "Καλημέρα σας. Τι θα θέλατε να πιείτε;",
          englishHint: "Answer with a drink order.",
        }),
      },
    );

    expect(reply.text).toBe("Καλημέρα σας. Τι θα θέλατε να πιείτε;");
    expect(reply.englishHint).toBe("Answer with a drink order.");
  });
});

describe("Gemini conversation replier", () => {
  it("normalizes Gemini JSON into the reply contract", async () => {
    const reply = await replyToConversationWithGemini(
      {
        difficulty: "standard",
        scenario: "Greet the waiter at a cafe.",
        scenarioGoals: ["greet politely"],
        messages: [{ role: "user", text: "Νερό παρακαλώ." }],
      },
      {
        apiKey: "test-key",
        generateContent: async () => ({
          text: "Βεβαίως. Θέλετε κάτι άλλο;",
          englishHint: "You can say no or order food.",
        }),
      },
    );

    expect(reply).toEqual({
      text: "Βεβαίως. Θέλετε κάτι άλλο;",
      englishHint: "You can say no or order food.",
    });
  });
});
