import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Fall back to harmless placeholders so `next build` doesn't crash when
// .env.local hasn't been filled in yet (e.g. first-time setup). Real
// requests will simply fail until real values are provided.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient: SupabaseClient | null = null;

/**
 * Browser / client-component client.
 *
 * Must be the auth-helpers client, not a plain `createClient`: it stores the
 * session in cookies, which is the only thing `middleware.ts` can read. A
 * plain client keeps the session in localStorage, so the middleware would see
 * no session and bounce every /dashboard request back to /login forever.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClientComponentClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey,
    });
  }
  return browserClient;
}

/**
 * Server-only client using the service role key. Used exclusively inside
 * API routes (app/api/**) where agents read/write data on the CEO's
 * behalf. Never import this from a client component.
 */
export function createServiceSupabaseClient(): SupabaseClient {
  if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
  }
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
}

// Convenience singleton for client components (`"use client"` files).
export const supabase = createBrowserSupabaseClient();
