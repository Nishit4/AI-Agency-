import { createServiceSupabaseClient } from "@/lib/supabase";
import { ASSISTANT_SYSTEM_PROMPT, callClaude } from "@/lib/claude";
import type { AgentChatRequest, AgentChatResponse } from "@/types";

/**
 * The CEO's single point of contact. Pulls a live snapshot of agency
 * state (pending approvals, active clients, agent health) into context
 * so the assistant can answer questions like "what needs my attention?"
 * without the CEO having to dig through the dashboard.
 */
export async function runAssistantAgent({ message, history }: AgentChatRequest): Promise<AgentChatResponse> {
  const supabase = createServiceSupabaseClient();

  const [{ count: pendingApprovals }, { count: activeClients }, { data: erroredAgents }] = await Promise.all([
    supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("clients").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("agents").select("name, department, last_error").eq("status", "error"),
  ]);

  const snapshot = [
    `Pending approvals: ${pendingApprovals ?? 0}`,
    `Active clients: ${activeClients ?? 0}`,
    erroredAgents && erroredAgents.length > 0
      ? `Agents currently in error: ${erroredAgents.map((a) => a.name).join(", ")}`
      : "No agents currently in error.",
  ].join("\n");

  const contextualMessage = `Current agency snapshot:\n${snapshot}\n\nCEO message: ${message}`;

  const reply = await callClaude({
    systemPrompt: ASSISTANT_SYSTEM_PROMPT,
    messages: [...(history ?? []), { role: "user", content: contextualMessage }],
  });

  await supabase.from("agent_messages").insert([
    { role: "user", content: message, agent_name: "assistant" },
    { role: "assistant", content: reply, agent_name: "assistant" },
  ]);

  return { reply, agent_name: "assistant" };
}
