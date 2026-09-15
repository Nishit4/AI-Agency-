import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { Department } from "@/types";

/**
 * Inbound webhook for self-hosted n8n workflows to report results back
 * into SmartOps (e.g. a completed automation, a captured lead form
 * submission). Protect it with a shared secret header:
 *   X-N8N-Secret: <N8N_WEBHOOK_SECRET>
 */
export async function POST(req: NextRequest) {
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET;
  const providedSecret = req.headers.get("x-n8n-secret");

  if (!expectedSecret || providedSecret !== expectedSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = await parseJsonBody<{
    event?: string;
    agent_name?: string;
    department?: Department;
    client_id?: string;
    title?: string;
    result?: string;
    lead?: {
      name?: string;
      company?: string;
      email?: string;
      phone?: string;
      source?: string;
      campaign_id?: string;
    };
  }>(req);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const supabase = createServiceSupabaseClient();

  switch (body.event) {
    case "task.completed": {
      const { agent_name, department, client_id, title, result } = body;
      if (!agent_name || !department || !title) {
        return NextResponse.json({ error: "agent_name, department, title are required" }, { status: 400 });
      }
      await supabase.from("agent_tasks").insert({
        agent_name,
        department,
        client_id: client_id ?? null,
        title,
        status: "done",
        result: result ?? null,
      });
      break;
    }
    case "lead.captured": {
      const { name, company, email, phone, source, campaign_id } = body.lead ?? {};
      if (!name || !email) {
        return NextResponse.json({ error: "lead.name and lead.email are required" }, { status: 400 });
      }
      await supabase.from("leads").insert({
        name,
        company: company ?? null,
        email,
        phone: phone ?? null,
        source: source ?? "n8n",
        campaign_id: campaign_id ?? null,
      });
      break;
    }
    default:
      return NextResponse.json({ error: `Unknown event type: ${body.event}` }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}
