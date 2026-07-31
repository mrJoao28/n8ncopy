import { NonRetriableError } from "inngest";
import { inngest } from "./client";
import prisma from "@/lib/db";
import { topologicalSort } from "./utils";
import { getExecutor } from "@/features/executions/lib/executor-registry";

export const executeWorkflow = inngest.createFunction(
  {
    id: "execute-workflow",
    triggers: [{ event: "workflows/execute.workflow" }],
  },
  async ({ event, step }) => {
    const workflowId = event.data.workflowId;

    if (typeof workflowId !== "string" || !workflowId.trim()) {
      throw new NonRetriableError("Workflow ID is missing or invalid");
    }

    const workflow = await step.run("prepare-workflow", async () => {
      return prisma.workflow.findUnique({
        where: { id: workflowId },
        include: {
          nodes: true,
          connections: true,
        },
      });
    });

    if (!workflow) {
      throw new NonRetriableError(`Workflow not found: ${workflowId}`);
    }

    const sortedNodes = topologicalSort(workflow.nodes, workflow.connections);
    let context =
      event.data.initialData && typeof event.data.initialData === "object"
        ? event.data.initialData
        : {};

    for (const node of sortedNodes) {
      const executor = getExecutor(node.type);

      context = await executor({
        data: (node.data as Record<string, unknown>) || {},
        nodeId: node.id,
        context,
        step,
      });
    }

    return {
      workflowId,
      result: context,
    };
  },
);
