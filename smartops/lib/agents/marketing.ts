import { createServiceSupabaseClient } from "@/lib/supabase";
import { AGENTS, actionRequiresApproval, callAgent } from "@/lib/claude";
import type { AgentChatRequest, AgentChatResponse, Client } from "@/types";

const LEAD_AGENT = "CMO Agent" as const;
const DEPARTMENT = "marketing" as const;

/**
 * Runs a Marketing department request: campaign strategy, content drafts,
 * lead qualification, and SEO. Publishing anything externally or
 * allocating budget requires CEO approval.
 */
export async function runMarketingAgent({ message, history, clientId }: AgentChatRequest): Promise<AgentChatResponse> {
  const supabase = createServiceSupabaseClient();

  let client: Client | null = null;
  if (clientId) {
    const { data } = await supabase.from("clients").select("*").eq("id", clientId).single();
    client = data as Client | null;
  }

  const contextualMessage = client
    ? `Client context: ${client.name} (${client.company}), plan ${client.plan_name} at ₹${client.plan_amount}/mo, status: ${client.status}.\n\nRequest: ${message}`
    : message;

  await supabase
    .from("agents")
    .update({ status: "running", last_run_at: new Date().toISOString() })
    .eq("name", LEAD_AGENT);

  let reply: string;
  try {
    reply = await callAgent(LEAD_AGENT, contextualMessage, history);
  } catch (err) {
    await supabase
      .from("agents")
      .update({ status: "error", last_error: err instanceof Error ? err.message : String(err) })
      .eq("name", LEAD_AGENT);
    throw err;
  }

  const needsApproval = actionRequiresApproval(LEAD_AGENT, reply);

  await supabase.from("agent_tasks").insert({
    agent_name: LEAD_AGENT,
    department: DEPARTMENT,
    client_id: clientId ?? null,
    title: message.slice(0, 120),
    status: needsApproval ? "queued" : "done",
    result: reply,
  });

  let approval: AgentChatResponse["approval"];
  if (needsApproval) {
    const { data } = await supabase
      .from("approvals")
      .insert({
        department: DEPARTMENT,
        agent_name: LEAD_AGENT,
        title: `${LEAD_AGENT}: ${message.slice(0, 80)}`,
        description: reply,
        client_id: clientId ?? null,
      })
      .select()
      .single();
    approval = data ?? undefined;
  }

  await supabase
    .from("agents")
    .update({ status: needsApproval ? "awaiting_approval" : "idle" })
    .eq("name", LEAD_AGENT);

  return {
    reply,
    agent_name: LEAD_AGENT,
    requires_approval: needsApproval,
    approval,
  };
}

export const marketingAgents = Object.values(AGENTS).filter((a) => a.department === DEPARTMENT);
