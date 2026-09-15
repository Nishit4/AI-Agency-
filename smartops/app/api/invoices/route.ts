import { NextRequest, NextResponse } from "next/server";
import { parseJsonBody } from "@/lib/http";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { createPaymentLink } from "@/lib/razorpay";
import { sendEmail } from "@/lib/resend";
import { formatINR } from "@/lib/utils";
import type { Client } from "@/types";

// GET /api/invoices?status=overdue — list invoices with their client.
export async function GET(req: NextRequest) {
  const supabase = createServiceSupabaseClient();
  const status = req.nextUrl.searchParams.get("status");

  let query = supabase
    .from("invoices")
    .select("*, clients(company, name, email)")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ invoices: data });
}

/**
 * POST /api/invoices — bills a client.
 * Creates a Razorpay payment link, stores the invoice, and emails the
 * client the link. This is what runs once the CEO approves a Billing
 * Agent request from the approvals queue.
 *
 * Body: { client_id, amount?, due_date?, send_email? }
 */
export async function POST(req: NextRequest) {
  const parsed = await parseJsonBody<{
    client_id?: string;
    amount?: number;
    due_date?: string;
    send_email?: boolean;
  }>(req);
  if (!parsed.ok) return parsed.response;

  const supabase = createServiceSupabaseClient();
  const { client_id, amount, due_date, send_email = true } = parsed.data;

  if (!client_id) {
    return NextResponse.json({ error: "client_id is required" }, { status: 400 });
  }

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .select("*")
    .eq("id", client_id)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const typedClient = client as Client;
  const invoiceAmount = amount ?? Number(typedClient.plan_amount);
  const dueDate = due_date ? new Date(due_date) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  let paymentLink;
  try {
    paymentLink = await createPaymentLink({
      amount: invoiceAmount,
      description: `SmartOps — ${typedClient.plan_name} plan for ${typedClient.company}`,
      customer: {
        name: typedClient.name,
        email: typedClient.email,
        contact: typedClient.phone ?? undefined,
      },
      dueDate,
      notes: { client_id: typedClient.id, company: typedClient.company },
    });
  } catch (err) {
    console.error("[api/invoices] Razorpay payment link failed", err);
    return NextResponse.json({ error: "Could not create payment link." }, { status: 502 });
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      client_id: typedClient.id,
      amount: invoiceAmount,
      status: "sent",
      razorpay_order_id: paymentLink.id,
      due_date: dueDate.toISOString().slice(0, 10),
    })
    .select()
    .single();

  if (invoiceError) {
    return NextResponse.json({ error: invoiceError.message }, { status: 500 });
  }

  if (send_email) {
    try {
      await sendEmail({
        to: typedClient.email,
        subject: `Invoice from SmartOps — ${formatINR(invoiceAmount)} due ${dueDate.toLocaleDateString("en-IN")}`,
        html: invoiceEmail(typedClient, invoiceAmount, dueDate, paymentLink.short_url),
      });
    } catch (err) {
      // The invoice exists and is payable; a failed email shouldn't fail the request.
      console.error("[api/invoices] invoice email failed", err);
    }
  }

  return NextResponse.json({ invoice, payment_url: paymentLink.short_url }, { status: 201 });
}

function invoiceEmail(client: Client, amount: number, dueDate: Date, paymentUrl: string) {
  return `
    <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto;">
      <h2 style="color:#4338ca;">Invoice for ${client.company}</h2>
      <p>Hi ${client.name},</p>
      <p>Your invoice for the <strong>${client.plan_name}</strong> plan is ready.</p>
      <table style="margin: 20px 0; font-size: 15px;">
        <tr><td style="padding: 4px 16px 4px 0; color:#64748b;">Amount</td><td><strong>${formatINR(amount)}</strong></td></tr>
        <tr><td style="padding: 4px 16px 4px 0; color:#64748b;">Due date</td><td>${dueDate.toLocaleDateString("en-IN")}</td></tr>
      </table>
      <a href="${paymentUrl}" style="display:inline-block;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">Pay ${formatINR(amount)}</a>
      <p style="margin-top:24px;color:#64748b;font-size:13px;">Paid via Razorpay. Reply to this email with any questions.</p>
    </div>
  `;
}
