"use client";

import { useRealtime } from "inngest/react";
import { useEffect, useState } from "react";
import type { NodeStatus } from "@/components/react-flow/node-status-indicator";
import { googleFormTriggerChannel } from "@/inngest/channels";

// How long the node stays flashed as "success"/"error" after a submission
// arrives before it settles back to its idle state.
const FLASH_DURATION_MS = 3000;

/**
 * Subscribes to the realtime "status" topic for a Google Form Trigger node.
 * Unlike an action node, a trigger doesn't stay "loading" — it just flashes
 * once per webhook call and then returns to "initial".
 */
export const useGoogleFormTriggerStatus = (nodeId: string): NodeStatus => {
  const [status, setStatus] = useState<NodeStatus>("initial");

  const { messages } = useRealtime({
    channel: googleFormTriggerChannel(nodeId),
    topics: ["status"],
    token: () =>
      fetch(
        `/api/realtime-token?channel=google-form-trigger&nodeId=${nodeId}`,
      ).then((res) => res.json()),
  });

  const lastMessage = messages.byTopic.status;

  useEffect(() => {
    if (!lastMessage) return;

    setStatus(lastMessage.data.status);

    const timeout = setTimeout(() => setStatus("initial"), FLASH_DURATION_MS);
    return () => clearTimeout(timeout);
  }, [lastMessage]);

  return status;
};