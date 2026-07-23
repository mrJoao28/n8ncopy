"use client";

import { useRealtime } from "inngest/react";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import { aiNodeChannel, httpRequestChannel } from "@/inngest/channels";

const channelBuilders = {
  "http-request": httpRequestChannel,
  "ai-node": aiNodeChannel,
} as const;

type ChannelType = keyof typeof channelBuilders;

/**
 * Subscribes to the realtime "status" topic for a given node id and returns
 * its current execution status ("initial" until the first message arrives).
 * Defaults to the "http-request" channel; pass "ai-node" for AI nodes.
 */
export const useNodeStatus = (
  nodeId: string,
  channelType: ChannelType = "http-request",
): NodeStatus => {
  const buildChannel = channelBuilders[channelType];

  const { messages } = useRealtime({
    channel: buildChannel(nodeId),
    topics: ["status"],
    token: () =>
      fetch(`/api/realtime-token?channel=${channelType}&nodeId=${nodeId}`).then(
        (res) => res.json(),
      ),
  });

  return messages.byTopic.status?.data.status ?? "initial";
};