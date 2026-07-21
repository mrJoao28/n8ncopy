// src/inngest/functions.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { inngest } from "./client";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

export const processTask = inngest.createFunction(
  { id: "execute-ai", triggers: { event: "execute/ai" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      const { text } = await step.ai.wrap("gemini-generate-text", generateText, {
        model: google("gemini-2.0-flash"),
        system: "You are a helpful assistant",
        prompt: "what is 2+2",
      })

      return { processed: true, id: event.data.id, text };
    });

    await step.sleep("pause", "1s");

    return result;
  }
);