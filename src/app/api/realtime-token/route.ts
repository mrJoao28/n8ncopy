import { getSubscriptionToken } from "inngest/realtime";
import { type NextRequest, NextResponse } from "next/server";
import {
  googleFormTriggerChannel,
  httpRequestChannel,
} from "@/inngest/channels";
import { inngest } from "@/inngest/client";

const channelBuilders = {
  "http-request": httpRequestChannel,
  "google-form-trigger": googleFormTriggerChannel,
} as const;

type ChannelKey = keyof typeof channelBuilders;

const isChannelKey = (value: string | null): value is ChannelKey =>
  !!value && value in channelBuilders;

export async function GET(req: NextRequest) {
  const nodeId = req.nextUrl.searchParams.get("nodeId");
  const channelKey = req.nextUrl.searchParams.get("channel");

  if (!nodeId) {
    return NextResponse.json({ error: "nodeId is required" }, { status: 400 });
  }

  if (!isChannelKey(channelKey)) {
    return NextResponse.json(
      { error: "channel must be one of: http-request, google-form-trigger" },
      { status: 400 },
    );
  }

  const buildChannel = channelBuilders[channelKey];

  const token = await getSubscriptionToken(inngest, {
    channel: buildChannel(nodeId),
    topics: ["status"],
  });

  return NextResponse.json(token);
}