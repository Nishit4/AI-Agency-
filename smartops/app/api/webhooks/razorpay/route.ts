import { NextRequest, NextResponse } from "next/server";
import { createServiceSupabaseClient } from "@/lib/supabase";
import { verifyRazorpaySignature } from "@/lib/razorpay";

/**
 * Razorpay webhook: payment.captured / payment.failed / order.paid.
 * Configure this URL (https://yourapp.com/api/webhooks/razorpay) in the
 * Razorpay dashboard with the same secret as RAZORPAY_WEBHOOK_SECRET.
 */
export async function POST(req: NextRequest) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "RAZORPAY_WEBHOOK_SECRET not configured" }, { status: 500 });
  }

  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyRazorpaySignature(rawBody, signature, secret)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Signature already verified above, but a malformed body should still be a
  // 400 rather than an unhandled throw.
  let event: { event?: string; payload?: Record<string, { entity?: Record<string, string> }> };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Body must be valid JSON." }, { status: 400 });
  }

  const supabase = createServiceSupabaseClient();

  switch (event.event) {
    // Invoices raised via /api/invoices are Razorpay payment links, so the
    // link id is what's stored in razorpay_order_id.
    case "payment_link.paid": {
      const link = event.payload?.payment_link?.entity;
      const payment = event.payload?.payment?.entity;
      if (link?.id) {
        await supabase
          .from("invoices")
          .update({
            status: "paid",
            razorpay_payment_id: payment?.id ?? null,
            paid_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", link.id);
      }
      break;
    }
    case "payment.captured": {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      if (orderId) {
        await supabase
          .from("invoices")
          .update({ status: "paid", razorpay_payment_id: payment.id, paid_at: new Date().toISOString() })
          .eq("razorpay_order_id", orderId);
      }
      break;
    }
    case "payment.failed": {
      const payment = event.payload?.payment?.entity;
      const orderId = payment?.order_id;
      if (orderId) {
        await supabase.from("invoices").update({ status: "overdue" }).eq("razorpay_order_id", orderId);
      }
      break;
    }
    default:
      // Unhandled event types are acknowledged but ignored.
      break;
  }

  return NextResponse.json({ received: true });
}
