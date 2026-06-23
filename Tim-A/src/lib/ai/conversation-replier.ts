import type { Difficulty } from "@/features/difficulty/rules";

export type ConversationReplyMessage = {
  role: "assistant" | "user";
  text: string;
};

export type ReplyToConversationInput = {
  difficulty: Difficulty;
  scenario: string;
  scenarioGoals: string[];
  messages: ConversationReplyMessage[];
};

export type ConversationReply = {
  text: string;
  englishHint: string;
};
