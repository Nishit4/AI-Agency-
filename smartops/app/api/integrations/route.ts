import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { disconnectIntegration, requestConnection } from "@/lib/agents/integrations";
import type { Integration, IntegrationStatus } from "@/types";

// GET /api/integrations?status=connected
export async function GET(req: NextRequest) {
  const supabase = createServiceSupabaseClient();
  const status = req.nextUrl.searchParams.get("status") as IntegrationStatus | null;

  let query = supabase.from("integrations").select("*").order("name");
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Report whether each credential is actually present, without ever
  // returning the value itself.
  const integrations = ((data ?? []) as Integration[]).map((i) => ({
    ...i,
    credential_present: i.credential_env_var ? Boolean(process.env[i.credential_env_var]) : null,
  }));

  return NextResponse.json({ integrations });
}

/**
 * POST /api/integrations — { action: "request", integration_id, justification? }
 *
 * Raises a CEO approval. Deliberately has no "connect now" path: the only
 * way an integration goes live is through the approvals queue.
 */
export async function POST(req: NextRequest) {
  const { action, integration_id, justification } = await req.json();

  if (action !== "request") {
    return NextResponse.json(
      { error: 'Only { action: "request" } is supported. Connections require CEO approval.' },
      { status: 400 }
    );
  }
  if (!integration_id) {
    return NextResponse.json({ error: "integration_id is required" }, { status: 400 });
  }

  try {
    const approval = await requestConnection(integration_id, justification);
    return NextResponse.json(
      { approval, message: "Connection request raised — approve it in your approvals queue to go live." },
      { status: 201 }
    );
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Request failed" }, { status: 400 });
  }
}

// PATCH /api/integrations — { integration_id, action: "disconnect" }
export async function PATCH(req: NextRequest) {
  const { integration_id, action } = await req.json();

  if (!integration_id) {
    return NextResponse.json({ error: "integration_id is required" }, { status: 400 });
  }
  if (action !== "disconnect") {
    return NextResponse.json({ error: 'Only { action: "disconnect" } is supported here.' }, { status: 400 });
  }

  try {
    const integration = await disconnectIntegration(integration_id);
    return NextResponse.json({ integration });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Disconnect failed" }, { status: 500 });
  }
}
