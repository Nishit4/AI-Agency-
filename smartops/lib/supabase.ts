import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Fall back to harmless placeholders so `next build` doesn't crash when
// .env.local hasn't been filled in yet (e.g. first-time setup). Real
// requests will simply fail until real values are provided.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let browserClient: SupabaseClient | null = null;

/**
 * Browser / client-component client. Respects RLS and the CEO's
 * magic-link auth session. Lazily instantiated and memoized.
 */
export function createBrowserSupabaseClient(): SupabaseClient {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: true, autoRefreshToken: true },
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
