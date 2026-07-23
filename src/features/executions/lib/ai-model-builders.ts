import "server-only";

import { anthropic, createAnthropic } from "@ai-sdk/anthropic";
import { createGoogleGenerativeAI, google } from "@ai-sdk/google";
import { createOpenAI, openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import type { AiProviderId } from "@/config/ai-providers";

/**
 * Builds the AI SDK `LanguageModel` for a given provider + model id.
 *
 * When `apiKey` is provided (resolved from a saved Credential, see
 * `ai-executor.ts`) it's used instead of the environment variable. Otherwise
 * each provider function falls back to reading its key from the environment
 * automatically (GOOGLE_GENERATIVE_AI_API_KEY, OPENAI_API_KEY,
 * ANTHROPIC_API_KEY).
 */
export const buildAiModel = (
  providerId: AiProviderId,
  modelId: string,
  apiKey?: string,
): LanguageModel => {
  switch (providerId) {
    case "gemini":
      return apiKey ? createGoogleGenerativeAI({ apiKey })(modelId) : google(modelId);
    case "openai":
      return apiKey ? createOpenAI({ apiKey })(modelId) : openai(modelId);
    case "anthropic":
      return apiKey ? createAnthropic({ apiKey })(modelId) : anthropic(modelId);
  }
};