import { getSubscriptionToken } from "inngest/realtime";
import { type NextRequest, NextResponse } from "next/server";
import { httpRequestChannel } from "@/inngest/channels";
import { inngest } from "@/inngest/client";

export async function GET(req: NextRequest) {
  const nodeId = req.nextUrl.searchParams.get("nodeId");

  if (!nodeId) {
    return NextResponse.json({ error: "nodeId is required" }, { status: 400 });
  }

  const token = await getSubscriptionToken(inngest, {
    channel: httpRequestChannel(nodeId),
    topics: ["status"],
  });

  return NextResponse.json(token);
}