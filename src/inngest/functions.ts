// src/inngest/functions.ts
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { inngest } from "./client";
import { generateText } from "ai";

const google = createGoogleGenerativeAI();

export const processTask = inngest.createFunction(
  { id: "execute-ai", triggers: { event: "execute/ai" } },
  async ({ event, step }) => {
    const result = await step.run("handle-task", async () => {
      const  {steps} = await step.ai.wrap("gemini-generate-text",generateText,{
        model:google("gemini-2.0-flash"),
        system: "You ara a helpful assistent",
        prompt:"what is 2+2",
      })

      return { processed: true, id: event.data.id };
      
    });

    await step.sleep("pause", "1s");

    return {step}
  }
);
