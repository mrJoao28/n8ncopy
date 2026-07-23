import type { LucideIcon } from "lucide-react";
import { BotIcon, BrainCircuitIcon, SparklesIcon } from "lucide-react";

export type AiProviderId = "gemini" | "openai" | "anthropic";

export type AiProviderModel = {
  id: string;
  label: string;
};

export type AiProviderConfig = {
  id: AiProviderId;
  label: string;
  icon: LucideIcon;
  defaultModel: string;
  models: AiProviderModel[];
  apiKeyEnvVar: string;
  pricingNote: string;
};

// Client-safe: only ids/labels used to render the dialog & node. The actual
// provider SDKs (@ai-sdk/google, @ai-sdk/openai, @ai-sdk/anthropic) are only
// imported server-side, in `ai-model-builders.ts`.
export const AI_PROVIDERS: Record<AiProviderId, AiProviderConfig> = {
  gemini: {
    id: "gemini",
    label: "Gemini",
    icon: SparklesIcon,
    defaultModel: "gemini-1.5-flash",
    models: [
      { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash" },
      { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    ],
    apiKeyEnvVar: "GOOGLE_GENERATIVE_AI_API_KEY",
    pricingNote: "Has a free tier",
  },
  openai: {
    id: "openai",
    label: "OpenAI",
    icon: BotIcon,
    defaultModel: "gpt-4o-mini",
    models: [
      { id: "gpt-4o-mini", label: "GPT-4o mini" },
      { id: "gpt-4o", label: "GPT-4o" },
      { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    ],
    apiKeyEnvVar: "OPENAI_API_KEY",
    pricingNote: "Requires a paid account (min. $5 credit)",
  },
  anthropic: {
    id: "anthropic",
    label: "Anthropic",
    icon: BrainCircuitIcon,
    defaultModel: "claude-3-5-haiku-latest",
    models: [
      { id: "claude-3-5-haiku-latest", label: "Claude 3.5 Haiku" },
      { id: "claude-3-5-sonnet-latest", label: "Claude 3.5 Sonnet" },
    ],
    apiKeyEnvVar: "ANTHROPIC_API_KEY",
    pricingNote: "Requires a paid account (min. $5 credit)",
  },
};