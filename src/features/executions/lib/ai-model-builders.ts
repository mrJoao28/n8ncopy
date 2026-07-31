import "server-only";

import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { AiProviderId } from "@/config/ai-providers";

export const buildAiModel = (
  providerId: AiProviderId,
  modelId: string,
  apiKey?: string,
): LanguageModel => {
  switch (providerId) {
    case "gemini":
      return apiKey
        ? createGoogleGenerativeAI({ apiKey })(modelId)
        : google(modelId);
    case "openai":
      return apiKey
        ? createOpenAI({ apiKey })(modelId)
        : openai(modelId);
    case "anthropic":
      return apiKey
        ? createAnthropic({ apiKey })(modelId)
        : anthropic(modelId);
    default: {
      const exhaustiveCheck: never = providerId;
      throw new Error(`Unsupported AI provider: ${exhaustiveCheck}`);
    }
  }
};
