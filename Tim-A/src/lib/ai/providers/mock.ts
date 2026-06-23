import type {
  ConversationScore,
  ScoreConversationInput,
} from "@/lib/ai/conversation-scorer";
import type {
  ConversationReply,
  ReplyToConversationInput,
} from "@/lib/ai/conversation-replier";

export async function scoreConversationWithMock(
  input: ScoreConversationInput,
): Promise<ConversationScore> {
  const wordCount = input.transcript.trim().split(/\s+/).filter(Boolean).length;
  const goalBonus = input.scenarioGoals.length * 5;
  const difficultyBonus = input.difficulty === "competitive" ? 5 : 0;
  const base = clampScore(50 + wordCount * 3 + goalBonus + difficultyBonus);

  return {
    overallScore: base,
    relevanceScore: base,
    completenessScore: clampScore(base + 2),
    fluencyScore: clampScore(base - 5),
    confidenceScore: clampScore(base - 3),
    speakingQualityScore: 70,
    strengths: [
      "You completed the scenario and kept the conversation relevant.",
    ],
    improvementTips: [
      "Try adding one more complete Greek sentence next time.",
    ],
  };
}

export async function replyToConversationWithMock(
  input: ReplyToConversationInput,
): Promise<ConversationReply> {
  const userTurns = input.messages.filter((message) => message.role === "user");
  const lastUserText = userTurns.at(-1)?.text.toLowerCase() ?? "";

  if (lastUserText.includes("ευχαρισ") || lastUserText.includes("thank")) {
    return {
      text: "Παρακαλώ! Καλή σας μέρα.",
      englishHint: "You can end the conversation politely now.",
    };
  }

  if (lastUserText.includes("νερό") || lastUserText.includes("water")) {
    return {
      text: "Βεβαίως. Θα θέλατε κάτι άλλο;",
      englishHint: "Ask for one more item or say thank you.",
    };
  }

  if (userTurns.length >= 3) {
    return {
      text: "Ωραία. Ευχαριστώ πολύ!",
      englishHint: "Wrap up with a polite goodbye.",
    };
  }

  return {
    text: "Μάλιστα. Τι θα θέλατε να παραγγείλετε;",
    englishHint: "Answer with a simple drink or food order.",
  };
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}
