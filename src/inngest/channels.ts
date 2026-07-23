import { realtime } from "inngest";
import { z } from "zod";

/**
 * Realtime channel used to stream execution status updates for a single
 * "HTTP Request" node back to the browser (loading -> success | error).
 *
 * One channel instance per node id, so multiple nodes (in the same or
 * different workflow runs) never cross-talk on the same topic.
 */
export const httpRequestChannel = realtime.channel({
  name: (nodeId: string) => `http-request.${nodeId}`,
  topics: {
    status: {
      schema: z.object({
        status: z.enum(["loading", "success", "error"]),
        message: z.string().optional(),
      }),
    },
  },
});

/**
 * Realtime channel used to let a "Google Form Trigger" node flash its status
 * in the editor whenever the webhook receives a new form submission.
 *
 * One channel instance per node id, keyed the same way as `httpRequestChannel`.
 */
export const googleFormTriggerChannel = realtime.channel({
  name: (nodeId: string) => `google-form-trigger.${nodeId}`,
  topics: {
    status: {
      schema: z.object({
        status: z.enum(["success", "error"]),
        message: z.string().optional(),
      }),
    },
  },
});

/**
 * Realtime channel shared by every AI node (Gemini, OpenAI, Anthropic) to
 * stream generation status back to the browser (loading -> success | error).
 *
 * One channel instance per node id, same convention as `httpRequestChannel`.
 */
export const aiNodeChannel = realtime.channel({
  name: (nodeId: string) => `ai-node.${nodeId}`,
  topics: {
    status: {
      schema: z.object({
        status: z.enum(["loading", "success", "error"]),
        message: z.string().optional(),
      }),
    },
  },
});