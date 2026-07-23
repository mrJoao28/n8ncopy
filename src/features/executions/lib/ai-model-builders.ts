import "server-only";

import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { AiProviderId } from "@/config/ai-providers";

/**
 * Builds the AI SDK `LanguageModel` for a given provider + model id. Each
 * provider function reads its API key from the environment automatically
 * (GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY).
 */
export const buildAiModel = (
  providerId: AiProviderId,
  modelId: string,
): LanguageModel => {
  switch (providerId) {
    case "gemini":
      return google(modelId);
    case "openai":
      return openai(modelId);
    case "anthropic":
      return anthropic(modelId);
  }
};