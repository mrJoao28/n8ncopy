import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { AI_PROVIDERS, type AiProviderId } from "@/config/ai-providers";
import type { NodeExecutor } from "@/features/executions/types";
import { aiNodeChannel } from "@/inngest/channels";
import { buildAiModel } from "./ai-model-builders";

type AiNodeData = {
  prompt?: string;
  model?: string;
};

/**
 * Builds an executor for a given AI provider. Compiles the prompt (Handlebars,
 * same convention as the HTTP Request node's body/endpoint), calls the model
 * through the Vercel AI SDK, and streams loading/success/error over realtime.
 */
export const createAiExecutor = (
  providerId: AiProviderId,
): NodeExecutor<AiNodeData> => {
  const provider = AI_PROVIDERS[providerId];

  return async ({ nodeId, context, step, data }) => {
    const channel = aiNodeChannel(nodeId);

    if (!data.prompt) {
      await step.realtime.publish("publish-error-no-prompt", channel.status, {
        status: "error",
        message: `${provider.label} node: No prompt configured`,
      });
      throw new NonRetriableError(
        `${provider.label} node: No prompt configured`,
      );
    }

    await step.realtime.publish("publish-loading", channel.status, {
      status: "loading",
    });

    try {
      const result = await step.run(`${providerId}-generate-text`, async () => {
        const prompt = Handlebars.compile(data.prompt)(context);
        const modelId = data.model || provider.defaultModel;
        const model = buildAiModel(providerId, modelId);

        const { text } = await generateText({ model, prompt });

        return {
          ...context,
          aiResponse: {
            provider: providerId,
            model: modelId,
            text,
          },
        };
      });

      await step.realtime.publish("publish-success", channel.status, {
        status: "success",
      });

      return result;
    } catch (error) {
      await step.realtime.publish("publish-error", channel.status, {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : `${provider.label} request failed`,
      });
      throw error;
    }
  };
};