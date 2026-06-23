import type { Difficulty } from "@/features/difficulty/rules";

export type ScoreConversationInput = {
  sessionId: string;
  difficulty: Difficulty;
  scenario: string;
  scenarioGoals: string[];
  transcript: string;
};

export type ConversationScore = {
  overallScore: number;
  relevanceScore: number;
  completenessScore: number;
  fluencyScore: number;
  confidenceScore: number;
  speakingQualityScore: number;
  strengths: string[];
  improvementTips: string[];
};
