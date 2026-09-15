import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/http";
import { runFinanceAgent } from "@/lib/agents/finance";
import type { AgentChatRequest } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const parsed = await parseJsonBody<AgentChatRequest>(req);
    if (!parsed.ok) return parsed.response;
    const body = parsed.data;
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
