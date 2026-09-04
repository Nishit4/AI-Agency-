import { NextRequest, NextResponse } from "next/server";
import { runFinanceAgent } from "@/lib/agents/finance";
import type { AgentChatRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AgentChatRequest;
    if (!body.message || typeof body.message !== "string") {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }
    const result = await runFinanceAgent(body);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/agents/finance]", err);
    return NextResponse.json({ error: "Finance agent failed." }, { status: 500 });
  }
}
