import { createServiceSupabaseClient } from "@/lib/supabase";
import { callAgent } from "@/lib/claude";
import type { AgentChatRequest, AgentChatResponse, Integration } from "@/types";

const AGENT = "Integrations Agent" as const;
const DEPARTMENT = "technology" as const;

/**
 * The Integrations Agent. Unlike the department agents, this one is given
 * the live connection inventory as context so it can reason about what is
 * already connected, what is pending, and what it would need in order to
 * do a job the CEO is asking about.
 *
 * It has no ability to connect anything itself — connections only happen
 * through `requestConnection` below, which routes via the approvals queue.
 */
export async function runIntegrationsAgent({ message, history }: AgentChatRequest): Promise<AgentChatResponse> {
  const supabase = createServiceSupabaseClient();

  const { data } = await supabase.from("integrations").select("*").order("name");
  const integrations = (data ?? []) as Integration[];

  const inventory = integrations.length
    ? integrations
        .map((i) => `- ${i.name} (${i.provider}, ${i.kind}) — ${i.status}${i.scopes.length ? `; scopes: ${i.scopes.join(", ")}` : ""}`)
        .join("\n")
    : "No integrations in the catalog yet.";

  const contextualMessage = `Current integration inventory:\n${inventory}\n\nCEO message: ${message}`;

  await supabase
    .from("agents")
    .update({ status: "running", last_run_at: new Date().toISOString() })
    .eq("name", AGENT);

  let reply: string;
  try {
    reply = await callAgent(AGENT, contextualMessage, history);
  } catch (err) {
    await supabase
      .from("agents")
      .update({ status: "error", last_error: err instanceof Error ? err.message : String(err) })
      .eq("name", AGENT);
    throw err;
  }

  await supabase.from("agents").update({ status: "idle" }).eq("name", AGENT);

  return { reply, agent_name: AGENT };
}

/**
 * Raises a CEO approval to connect an integration. This is the only path
 * to a live connection — nothing here flips the status to `connected`,
 * that happens in the approvals route once the CEO signs off.
 */
export async function requestConnection(integrationId: string, justification?: string) {
  const supabase = createServiceSupabaseClient();

  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", integrationId)
    .single();

  if (error || !integration) throw new Error("Integration not found");

  const typed = integration as Integration;
  if (typed.status === "connected") {
    throw new Error(`${typed.name} is already connected.`);
  }
  if (typed.status === "pending_approval") {
    throw new Error(`${typed.name} already has a connection request awaiting your approval.`);
  }

  const description = [
    justification?.trim() || `Connect ${typed.name} (${typed.provider}) so agents can use it.`,
    "",
    `Type: ${typed.kind.toUpperCase()}${typed.endpoint ? ` · ${typed.endpoint}` : ""}`,
    `Scopes requested: ${typed.scopes.length ? typed.scopes.join(", ") : "none"}`,
    `Credential: set ${typed.credential_env_var ?? "n/a"} in your Vercel environment variables.`,
    "",
    "Approving marks this connection live. It does not transmit any secret —",
    "the credential is read from the host environment, never stored in the database.",
  ].join("\n");

  const { data: approval, error: approvalError } = await supabase
    .from("approvals")
    .insert({
      department: DEPARTMENT,
      agent_name: AGENT,
      title: `Connect ${typed.name} (${typed.kind.toUpperCase()})`,
      description,
      payload: {
        action: "connect_integration",
        integration_id: typed.id,
        integration_name: typed.name,
        scopes: typed.scopes,
        credential_env_var: typed.credential_env_var,
      },
    })
    .select()
    .single();

  if (approvalError) throw new Error(approvalError.message);

  await supabase.from("integrations").update({ status: "pending_approval" }).eq("id", typed.id);

  return approval;
}

/**
 * Completes an approved connection. Called by the approvals route after
 * the CEO approves — refuses if the credential env var isn't actually set,
 * so a connection is never marked live when it couldn't possibly work.
 */
export async function activateConnection(integrationId: string) {
  const supabase = createServiceSupabaseClient();

  const { data: integration, error } = await supabase
    .from("integrations")
    .select("*")
    .eq("id", integrationId)
    .single();

  if (error || !integration) throw new Error("Integration not found");
  const typed = integration as Integration;

  const envVar = typed.credential_env_var;
  if (envVar && !process.env[envVar]) {
    const detail = `${envVar} is not set in the environment.`;
    await supabase
      .from("integrations")
      .update({ status: "error", last_error: detail, last_checked_at: new Date().toISOString() })
      .eq("id", typed.id);
    return { connected: false, detail: `Approved, but ${typed.name} can't go live yet — ${detail} Add it in Vercel, then re-approve.` };
  }

  await supabase
    .from("integrations")
    .update({
      status: "connected",
      connected_at: new Date().toISOString(),
      last_checked_at: new Date().toISOString(),
      last_error: null,
    })
    .eq("id", typed.id);

  return { connected: true, detail: `${typed.name} is now connected with scopes: ${typed.scopes.join(", ") || "none"}.` };
}

/** Disconnects an integration. Always allowed without approval — reducing access is safe. */
export async function disconnectIntegration(integrationId: string) {
  const supabase = createServiceSupabaseClient();
  const { data, error } = await supabase
    .from("integrations")
    .update({ status: "disabled", connected_at: null })
    .eq("id", integrationId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Integration;
}
