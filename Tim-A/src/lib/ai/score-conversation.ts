import type {
  ConversationScore,
  ScoreConversationInput,
} from "@/lib/ai/conversation-scorer";
import { scoreConversationWithGemini } from "@/lib/ai/providers/gemini";
import { scoreConversationWithMock } from "@/lib/ai/providers/mock";

type ScoreConversationOptions = {
  provider?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  generateGeminiContent?: (input: ScoreConversationInput) => Promise<unknown>;
};

export async function scoreConversation(
  input: ScoreConversationInput,
  options: ScoreConversationOptions = {},
): Promise<ConversationScore> {
  const provider = (options.provider ?? process.env.AI_PROVIDER ?? "mock")
    .trim()
    .toLowerCase();

  if (provider === "gemini") {
    return scoreConversationWithGemini(input, {
      apiKey: options.geminiApiKey,
      model: options.geminiModel,
      generateContent: options.generateGeminiContent,
    });
  }

  return scoreConversationWithMock(input);
}
