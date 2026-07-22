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