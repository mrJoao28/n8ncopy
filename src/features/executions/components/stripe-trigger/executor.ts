import type { NodeExecutor } from "@/features/executions/types";
 
type StripeTriggerData = Record<string, unknown>;
 
export const stripeTriggerExecutor: NodeExecutor<StripeTriggerData> = async ({
  context,
  step,
}) => {
  const result = await step.run("stripe-trigger", async () => context);
 
  return result;
};
 