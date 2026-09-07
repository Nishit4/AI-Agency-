import Razorpay from "razorpay";
import crypto from "crypto";

let razorpayClient: Razorpay | null = null;

function getClient(): Razorpay {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "",
    });
  }
  return razorpayClient;
}

export interface CreateOrderInput {
  amount: number; // in INR (rupees) — converted to paise internally
  receipt: string;
  notes?: Record<string, string>;
}

/** Creates a Razorpay order for a client invoice. Amount is in INR rupees. */
export async function createRazorpayOrder({ amount, receipt, notes }: CreateOrderInput) {
  return getClient().orders.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    receipt,
    notes,
  });
}

export interface CreatePaymentLinkInput {
  amount: number; // INR rupees
  description: string;
  customer: { name: string; email: string; contact?: string };
  dueDate: Date;
  notes?: Record<string, string>;
}

/**
 * Creates a Razorpay payment link — a self-contained, emailable URL the
 * client can pay from directly. Preferred over a bare order for invoicing
 * since it needs no checkout page of our own.
 */
export async function createPaymentLink({ amount, description, customer, dueDate, notes }: CreatePaymentLinkInput) {
  return getClient().paymentLink.create({
    amount: Math.round(amount * 100), // paise
    currency: "INR",
    description,
    customer: {
      name: customer.name,
      email: customer.email,
      contact: customer.contact,
    },
    notify: { email: true, sms: Boolean(customer.contact) },
    reminder_enable: true,
    expire_by: Math.floor(dueDate.getTime() / 1000),
    notes,
  });
}

/**
 * Verifies the HMAC signature Razorpay sends with a `payment.captured`
 * (or checkout success) webhook/callback, using the webhook secret.
 */
export function verifyRazorpaySignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");
  return safeCompare(expected, signature);
}

/** Verifies the signature returned to the browser after a successful checkout. */
export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeCompare(expected, signature);
}

function safeCompare(expected: string, actual: string): boolean {
  const expectedBuf = Buffer.from(expected);
  const actualBuf = Buffer.from(actual);
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}
