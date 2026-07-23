import type { NodeProps } from "@xyflow/react";
import { memo } from "react";
import { AI_PROVIDERS } from "@/config/ai-providers";
import { AiNode } from "../ai-node/node";

export const OpenAiNode = memo((props: NodeProps) => (
  <AiNode {...props} provider={AI_PROVIDERS.openai} />
));

OpenAiNode.displayName = "OpenAiNode";