import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { triggerWorkflow } from "@/lib/n8n";
import type { Approval, ApprovalStatus } from "@/types";

// GET /api/approvals?status=pending — list approvals, newest first.
export async function GET(req: NextRequest) {
  const supabase = createServiceSupabaseClient();
  const status = req.nextUrl.searchParams.get("status") as ApprovalStatus | null;

  let query = supabase.from("approvals").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ approvals: data });
}

// POST /api/approvals — an agent (server-side) raises a new approval request.
export async function POST(req: NextRequest) {
  const supabase = createServiceSupabaseClient();
  const body = await req.json();

  const { department, agent_name, title, description, payload, client_id } = body;
  if (!department || !agent_name || !title || !description) {
    return NextResponse.json({ error: "department, agent_name, title, description are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("approvals")
    .insert({ department, agent_name, title, description, payload: payload ?? {}, client_id: client_id ?? null })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ approval: data }, { status: 201 });
}

// PATCH /api/approvals — CEO approves or rejects: { id, status, resolved_by }
export async function PATCH(req: NextRequest) {
  const supabase = createServiceSupabaseClient();
  const body = await req.json();
  const { id, status, resolved_by } = body as { id: string; status: ApprovalStatus; resolved_by?: string };

  if (!id || !status || !["approved", "rejected"].includes(status)) {
    return NextResponse.json({ error: "id and a valid status (approved|rejected) are required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("approvals")
    .update({ status, resolved_at: new Date().toISOString(), resolved_by: resolved_by ?? "CEO" })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // An approval is only meaningful if approving it actually executes the
  // action the agent proposed. Rejections just close the record.
  let execution: ExecutionResult | undefined;
  if (status === "approved") {
    execution = await executeApprovedAction(data as Approval);
  }

  return NextResponse.json({ approval: data, execution });
}

interface ExecutionResult {
  ran: boolean;
  detail: string;
}

/**
 * Carries out an approved action. Each department maps to the side effect
 * its agents are allowed to trigger once the CEO signs off. Failures are
 * reported back but never roll back the approval itself — the CEO's
 * decision is recorded regardless of whether the downstream call succeeded.
 */
async function executeApprovedAction(approval: Approval): Promise<ExecutionResult> {
  const payload = (approval.payload ?? {}) as Record<string, unknown>;

  try {
    switch (approval.department) {
      case "finance": {
        if (!approval.client_id || typeof payload.invoice_amount !== "number") {
          return { ran: false, detail: "No invoice details on this approval — nothing to bill." };
        }
        const res = await fetch(`${appUrl()}/api/invoices`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            client_id: approval.client_id,
            amount: payload.invoice_amount,
            due_date: payload.due_date,
          }),
        });
        if (!res.ok) return { ran: false, detail: `Invoice creation failed: ${await res.text()}` };
        return { ran: true, detail: "Invoice created and payment link emailed to the client." };
      }

      case "technology": {
        if (typeof payload.workflow !== "string") {
          return { ran: false, detail: "No workflow named on this approval." };
        }
        await triggerWorkflow(payload.workflow, { approval_id: approval.id, ...payload });
        return { ran: true, detail: `Triggered n8n workflow "${payload.workflow}".` };
      }

      default:
        // Operations and marketing approvals are recorded for the agents to
        // act on in their next run rather than firing a side effect here.
        return { ran: false, detail: "Approved — the owning agent will action this on its next run." };
    }
  } catch (err) {
    console.error("[api/approvals] execution failed", err);
    return { ran: false, detail: err instanceof Error ? err.message : "Execution failed." };
  }
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://localhost:3000";
}
