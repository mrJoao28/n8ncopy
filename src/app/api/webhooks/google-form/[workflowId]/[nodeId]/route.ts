import { type NextRequest, NextResponse } from "next/server";
import { googleFormTriggerChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";

interface RouteParams {
  params: Promise<{
    workflowId: string;
    nodeId: string;
  }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  const { workflowId, nodeId } = await params;

  const workflow = await prisma.workflow.findUnique({
    where: { id: workflowId },
    select: { id: true },
  });

  if (!workflow) {
    return NextResponse.json({ error: "Workflow not found" }, { status: 404 });
  }

  let formResponse: unknown;
  try {
    formResponse = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  await inngest.send({
    name: "workflows/execute.workflow",
    data: {
      workflowId,
      initialData: { formResponse },
    },
  });

  // Non-durable: this is a fire-and-forget UI ping, not part of the
  // workflow run itself, so `inngest.realtime.publish` (not `step.realtime`)
  // is the right tool here.
  await inngest.realtime.publish(googleFormTriggerChannel(nodeId).status, {
    status: "success",
    message: "Form response received",
  });

  return NextResponse.json({ success: true });
}