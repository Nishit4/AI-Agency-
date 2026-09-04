import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { ApprovalStatus } from "@/types";

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
  return NextResponse.json({ approval: data });
}
