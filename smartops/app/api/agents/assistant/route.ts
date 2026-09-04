import { NextRequest, NextResponse } from "next/server";
import { runAssistantAgent } from "@/lib/agents/assistant";
import type { AgentChatRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentChatRequest;
    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    const result = await runAssistantAgent(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/agents/assistant]", err);
    return NextResponse.json({ error: "Failed to get a response from the assistant." }, { status: 500 });
  }
}
