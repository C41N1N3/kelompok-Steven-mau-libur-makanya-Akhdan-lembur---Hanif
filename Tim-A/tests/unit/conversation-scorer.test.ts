import { describe, expect, it } from "vitest";

import { scoreConversation } from "@/lib/ai/score-conversation";
import { scoreConversationWithGemini } from "@/lib/ai/providers/gemini";
import { scoreConversationWithMock } from "@/lib/ai/providers/mock";

describe("mock conversation scorer", () => {
  it("returns bounded scores and feedback", async () => {
    const result = await scoreConversationWithMock({
      sessionId: "session-1",
      difficulty: "competitive",
      scenario: "Greet the waiter at a cafe.",
      scenarioGoals: ["greet politely", "ask for water", "say thank you"],
      transcript: "Hello. Water please. Thank you.",
    });

    expect(result.overallScore).toBeGreaterThanOrEqual(0);
    expect(result.overallScore).toBeLessThanOrEqual(100);
    expect(result.strengths.length).toBeGreaterThan(0);
    expect(result.improvementTips.length).toBeGreaterThan(0);
  });
});

describe("conversation scorer provider selection", () => {
  it("uses Gemini when AI_PROVIDER is gemini", async () => {
    const result = await scoreConversation(
      {
        sessionId: "session-1",
        difficulty: "standard",
        scenario: "Greet the waiter at a cafe.",
        scenarioGoals: ["greet politely"],
        transcript: "Καλημέρα. Νερό παρακαλώ.",
      },
      {
        provider: "gemini",
        geminiApiKey: "test-key",
        generateGeminiContent: async () => ({
          overallScore: 82,
          relevanceScore: 90,
          completenessScore: 78,
          fluencyScore: 80,
          confidenceScore: 76,
          speakingQualityScore: 81,
          strengths: ["You handled the greeting clearly."],
          improvementTips: ["Add a short thank-you sentence."],
        }),
      },
    );

    expect(result.overallScore).toBe(82);
    expect(result.strengths).toContain("You handled the greeting clearly.");
  });
});

describe("Gemini conversation scorer", () => {
  it("normalizes Gemini JSON scores into the conversation score contract", async () => {
    const result = await scoreConversationWithGemini(
      {
        sessionId: "session-1",
        difficulty: "competitive",
        scenario: "Greet the waiter at a cafe.",
        scenarioGoals: ["greet politely", "ask for water"],
        transcript: "Καλημέρα. Νερό παρακαλώ.",
      },
      {
        apiKey: "test-key",
        generateContent: async () => ({
          overallScore: 140,
          relevanceScore: 88,
          completenessScore: 75,
          fluencyScore: 70,
          confidenceScore: 65,
          speakingQualityScore: 72,
          strengths: ["Polite opening."],
          improvementTips: ["Use one more Greek sentence."],
        }),
      },
    );

    expect(result.overallScore).toBe(100);
    expect(result.relevanceScore).toBe(88);
    expect(result.strengths).toEqual(["Polite opening."]);
  });
});
