import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import type { ClientStatus } from "@/types";

// GET /api/clients — list all clients, newest first.
export async function GET() {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clients: data });
}

// POST /api/clients — create a new client (e.g. after a lead converts).
export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody<{
    name?: string;
    company?: string;
    email?: string;
    phone?: string;
    plan_amount?: number;
    plan_name?: string;
    status?: ClientStatus;
  }>(req);
  if (!parsed.ok) return parsed.response;

  const supabase = createServiceSupabaseClient();
  const { name, company, email, phone, plan_amount, plan_name, status } = parsed.data;

  if (!name || !company || !email) {
    return NextResponse.json({ error: "name, company, email are required" }, { status: 400 });
  }
  if (plan_amount !== undefined && (plan_amount < 7499 || plan_amount > 150000)) {
    return NextResponse.json({ error: "plan_amount must be between ₹7,499 and ₹1,50,000" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("clients")
    .insert({
      name,
      company,
      email,
      phone: phone ?? null,
      plan_amount: plan_amount ?? 7499,
      plan_name: plan_name ?? "Starter",
      status: status ?? "lead",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data }, { status: 201 });
}

// PATCH /api/clients — update a client: { id, ...fields }
export async function PATCH(req: NextRequest) {
  const parsed = await parseJsonBody<{ id?: string } & Record<string, unknown>>(req);
  if (!parsed.ok) return parsed.response;

  const supabase = createServiceSupabaseClient();
  const { id, ...updates } = parsed.data;

  if (!id) return NextResponse.json({ error: "id is required" }, { status: 400 });

  const { data, error } = await supabase.from("clients").update(updates).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ client: data });
}
