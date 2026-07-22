import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripeTriggerChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";
import prisma from "@/lib/db";
import { stripeClient } from "@/lib/stripe";
 
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
 
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
 
  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing Stripe signature or webhook secret" },
      { status: 400 },
    );
  }
 
  // Stripe signature verification needs the raw request body, so we read it
  // as text instead of calling req.json().
  const rawBody = await req.text();
 
  let event: Stripe.Event;
  try {
    event = stripeClient.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret,
    );
  } catch (error) {
    await inngest.realtime.publish(stripeTriggerChannel(nodeId).status, {
      status: "error",
      message: "Invalid Stripe signature",
    });
 
    return NextResponse.json(
      {
        error: `Webhook signature verification failed: ${
          error instanceof Error ? error.message : "unknown error"
        }`,
      },
      { status: 400 },
    );
  }
 
  await inngest.send({
    name: "workflows/execute.workflow",
    data: {
      workflowId,
      initialData: {
        stripeEvent: {
          id: event.id,
          type: event.type,
          created: event.created,
          data: event.data,
        },
      },
    },
  });
 
  // Non-durable: this is a fire-and-forget UI ping, not part of the
  // workflow run itself, so `inngest.realtime.publish` (not `step.realtime`)
  // is the right tool here.
  await inngest.realtime.publish(stripeTriggerChannel(nodeId).status, {
    status: "success",
    message: `Received ${event.type}`,
  });
 
  return NextResponse.json({ success: true });
}