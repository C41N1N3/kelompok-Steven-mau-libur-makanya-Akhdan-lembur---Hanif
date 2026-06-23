import type {
  ConversationReply,
  ReplyToConversationInput,
} from "@/lib/ai/conversation-replier";
import { replyToConversationWithGemini } from "@/lib/ai/providers/gemini";
import { replyToConversationWithMock } from "@/lib/ai/providers/mock";

type ReplyToConversationOptions = {
  provider?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  generateGeminiContent?: (input: ReplyToConversationInput) => Promise<unknown>;
};

export async function replyToConversation(
  input: ReplyToConversationInput,
  options: ReplyToConversationOptions = {},
): Promise<ConversationReply> {
  const provider = (options.provider ?? process.env.AI_PROVIDER ?? "mock")
    .trim()
    .toLowerCase();

  if (provider === "gemini") {
    return replyToConversationWithGemini(input, {
      apiKey: options.geminiApiKey,
      model: options.geminiModel,
      generateContent: options.generateGeminiContent,
    });
  }

  return replyToConversationWithMock(input);
}
