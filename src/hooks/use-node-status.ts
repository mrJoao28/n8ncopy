"use client";

import { useRealtime } from "inngest/react";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import { httpRequestChannel } from "@/inngest/channels";

/**
 * Subscribes to the realtime "status" topic for a given node id and returns
 * its current execution status ("initial" until the first message arrives).
 */
export const useNodeStatus = (nodeId: string): NodeStatus => {
  const { messages } = useRealtime({
    channel: httpRequestChannel(nodeId),
    topics: ["status"],
    token: () =>
      fetch(`/api/realtime-token?channel=http-request&nodeId=${nodeId}`).then(
        (res) => res.json(),
      ),
  });

  return messages.byTopic.status?.data.status ?? "initial";
};