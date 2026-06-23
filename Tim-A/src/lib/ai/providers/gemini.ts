import type {
  ConversationScore,
  ScoreConversationInput,
} from "@/lib/ai/conversation-scorer";
import type {
  ConversationReply,
  ReplyToConversationInput,
} from "@/lib/ai/conversation-replier";

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

type GeminiOptions = {
  apiKey?: string;
  model?: string;
  generateContent?: (input: ScoreConversationInput) => Promise<unknown>;
};

type GeminiReplyOptions = {
  apiKey?: string;
  model?: string;
  generateContent?: (input: ReplyToConversationInput) => Promise<unknown>;
};

export async function scoreConversationWithGemini(
  input: ScoreConversationInput,
  options: GeminiOptions = {},
): Promise<ConversationScore> {
  const rawScore = options.generateContent
    ? await options.generateContent(input)
    : await requestGeminiScore(input, options);

  return normalizeConversationScore(rawScore);
}

export async function replyToConversationWithGemini(
  input: ReplyToConversationInput,
  options: GeminiReplyOptions = {},
): Promise<ConversationReply> {
  const rawReply = options.generateContent
    ? await options.generateContent(input)
    : await requestGeminiReply(input, options);

  return normalizeConversationReply(rawReply);
}

async function requestGeminiScore(
  input: ScoreConversationInput,
  options: GeminiOptions,
) {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  const model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildScoringPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              overallScore: { type: "integer" },
              relevanceScore: { type: "integer" },
              completenessScore: { type: "integer" },
              fluencyScore: { type: "integer" },
              confidenceScore: { type: "integer" },
              speakingQualityScore: { type: "integer" },
              strengths: { type: "array", items: { type: "string" } },
              improvementTips: { type: "array", items: { type: "string" } },
            },
            required: [
              "overallScore",
              "relevanceScore",
              "completenessScore",
              "fluencyScore",
              "confidenceScore",
              "speakingQualityScore",
              "strengths",
              "improvementTips",
            ],
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini scoring failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini scoring returned an empty response.");
  }

  return JSON.parse(text) as unknown;
}

async function requestGeminiReply(
  input: ReplyToConversationInput,
  options: GeminiReplyOptions,
) {
  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
  const model = options.model ?? process.env.GEMINI_MODEL ?? DEFAULT_GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is required when AI_PROVIDER=gemini.");
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: buildReplyPrompt(input) }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          responseMimeType: "application/json",
          responseSchema: {
            type: "object",
            properties: {
              text: { type: "string" },
              englishHint: { type: "string" },
            },
            required: ["text", "englishHint"],
          },
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Gemini reply failed with status ${response.status}.`);
  }

  const data = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: Array<{ text?: string }> };
    }>;
  };
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("Gemini reply returned an empty response.");
  }

  return JSON.parse(text) as unknown;
}

function buildScoringPrompt(input: ScoreConversationInput) {
  return [
    "Score this Greek learning conversation transcript.",
    "Return only JSON that matches the provided schema.",
    "Scores must be integers from 0 to 100.",
    "",
    `Difficulty: ${input.difficulty}`,
    `Scenario: ${input.scenario}`,
    `Scenario goals: ${input.scenarioGoals.join(", ") || "none"}`,
    "",
    "Transcript:",
    input.transcript || "(empty)",
  ].join("\n");
}

function buildReplyPrompt(input: ReplyToConversationInput) {
  const conversation = input.messages
    .map((message) => `${message.role}: ${message.text}`)
    .join("\n");

  return [
    "You are a friendly Greek conversation partner for a language learner.",
    "Continue the scenario naturally as the waiter or cafe staff.",
    "Return only JSON that matches the provided schema.",
    "The text field must be Greek-first and no more than two short sentences.",
    "The englishHint field must be one short English sentence that helps the learner respond.",
    "",
    `Difficulty: ${input.difficulty}`,
    `Scenario: ${input.scenario}`,
    `Scenario goals: ${input.scenarioGoals.join(", ") || "none"}`,
    "",
    "Conversation so far:",
    conversation || "(empty)",
  ].join("\n");
}

function normalizeConversationScore(value: unknown): ConversationScore {
  const record = isRecord(value) ? value : {};

  return {
    overallScore: clampScore(record.overallScore),
    relevanceScore: clampScore(record.relevanceScore),
    completenessScore: clampScore(record.completenessScore),
    fluencyScore: clampScore(record.fluencyScore),
    confidenceScore: clampScore(record.confidenceScore),
    speakingQualityScore: clampScore(record.speakingQualityScore),
    strengths: normalizeStringList(record.strengths, [
      "You completed the conversation attempt.",
    ]),
    improvementTips: normalizeStringList(record.improvementTips, [
      "Try adding one more complete Greek sentence next time.",
    ]),
  };
}

function clampScore(value: unknown) {
  const number = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(number)) return 0;
  return Math.max(0, Math.min(100, Math.round(number)));
}

function normalizeStringList(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;
  const strings = value.filter((item): item is string => {
    return typeof item === "string" && item.trim().length > 0;
  });
  return strings.length > 0 ? strings : fallback;
}

function normalizeConversationReply(value: unknown): ConversationReply {
  const record = isRecord(value) ? value : {};
  const text = typeof record.text === "string" ? record.text.trim() : "";
  const englishHint =
    typeof record.englishHint === "string" ? record.englishHint.trim() : "";

  return {
    text: text || "Συγγνώμη, μπορείτε να το πείτε ξανά;",
    englishHint: englishHint || "Try answering with a short Greek sentence.",
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
