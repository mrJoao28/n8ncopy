import { generateText } from "ai";
import Handlebars from "handlebars";
import { NonRetriableError } from "inngest";
import { AI_PROVIDERS, AI_PROVIDER_CREDENTIAL_TYPE, type AiProviderId } from "@/config/ai-providers";
import type { NodeExecutor } from "@/features/executions/types";
import { aiNodeChannel } from "@/inngest/channels";
import { decryptSecret } from "@/lib/encryption";
import prisma from "@/lib/db";
import { buildAiModel } from "./ai-model-builders";

type AiNodeData = {
  prompt?: string;
  model?: string;
  credentialId?: string;
};

export const createAiExecutor = (
  providerId: AiProviderId,
): NodeExecutor<AiNodeData> => {
  const provider = AI_PROVIDERS[providerId];

  return async ({ nodeId, context, step, data }) => {
    const channel = aiNodeChannel(nodeId);

    if (!data.prompt?.trim()) {
      await step.realtime.publish("publish-error-no-prompt", channel.status, {
        status: "error",
        message: `${provider.label} node: No prompt configured`,
      });
      throw new NonRetriableError(
        `${provider.label} node: No prompt configured`,
      );
    }

    const configuredModel = data.model || provider.defaultModel;
    const supportedModel = provider.models.some(
      (model) => model.id === configuredModel,
    );

    if (!supportedModel) {
      throw new NonRetriableError(
        `${provider.label} node: Unsupported model ${configuredModel}`,
      );
    }

    await step.realtime.publish("publish-loading", channel.status, {
      status: "loading",
    });

    try {
      const apiKey = data.credentialId
        ? await step.run(`${providerId}-resolve-credential`, async () => {
            const credential = await prisma.credential.findUnique({
              where: { id: data.credentialId },
              select: { value: true, type: true },
            });

            if (!credential) {
              throw new NonRetriableError(
                `${provider.label} node: Credential not found`,
              );
            }

            if (credential.type !== AI_PROVIDER_CREDENTIAL_TYPE[providerId]) {
              throw new NonRetriableError(
                `${provider.label} node: Credential type does not match provider`,
              );
            }

            return decryptSecret(credential.value);
          })
        : undefined;

      const result = await step.run(`${providerId}-generate-text`, async () => {
        const prompt = Handlebars.compile(data.prompt as string)(context);

        if (!prompt.trim()) {
          throw new NonRetriableError(
            `${provider.label} node: Prompt resolved to empty text`,
          );
        }

        const model = buildAiModel(providerId, configuredModel, apiKey);
        const { text } = await generateText({ model, prompt });

        return {
          ...context,
          aiResponse: {
            provider: providerId,
            model: configuredModel,
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
