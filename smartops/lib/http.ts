import { NextRequest, NextResponse } from "next/server";

type ParsedBody<T> = { ok: true; data: T } | { ok: false; response: NextResponse };

/**
 * Reads a JSON request body without letting a malformed one become an
 * unhandled 500. Every API route here is a system boundary — webhooks and
 * external callers do send broken payloads — so a bad body should come back
 * as a clean 400, not a stack trace.
 */
export async function parseJsonBody<T = Record<string, unknown>>(req: NextRequest): Promise<ParsedBody<T>> {
  try {
    return { ok: true, data: (await req.json()) as T };
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 }),
    };
  }
}
