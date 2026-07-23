import { AnthropicExecutor } from "@/features/executions/components/anthropic/executor";
import { GeminiExecutor } from "@/features/executions/components/gemini/executor";
import { OpenAiExecutor } from "@/features/executions/components/openai/executor";
import { googleFormTriggerExecutor } from "@/features/triggers/components/google-form-trigger/executor";
import { manualTriggerExecutor } from "@/features/triggers/components/manual-trigger/executor";
import { NodeType } from "@/generated/prisma";
import { HttpRequestExecutor } from "../components/http-request/executor";
import type { NodeExecutor } from "../types";

export const executorRegistry: Record<NodeType, NodeExecutor> = {
  [NodeType.MANUAL_TRIGGER]: manualTriggerExecutor, //dont need
  [NodeType.HTTP_REQUEST]: HttpRequestExecutor,
  [NodeType.INITIAL]: manualTriggerExecutor,
  [NodeType.GOOGLE_FORM_TRIGGER]: googleFormTriggerExecutor,
  [NodeType.GEMINI]: GeminiExecutor,
  [NodeType.OPENAI]: OpenAiExecutor,
  [NodeType.ANTHROPIC]: AnthropicExecutor,
};

export const getExecutor = (type: NodeType): NodeExecutor => {
  const executor = executorRegistry[type];
  if (!executor) {
    throw new Error(`No executor found for node type ${type}`);
  }
  return executor;
};