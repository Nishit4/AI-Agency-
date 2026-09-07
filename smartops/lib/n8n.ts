const N8N_BASE_URL = process.env.N8N_BASE_URL?.replace(/\/$/, "");
const N8N_API_KEY = process.env.N8N_API_KEY;

/**
 * Triggers an n8n workflow by its webhook path. This is how agents hand
 * off long-running or scheduled automation (invoice reminders, lead
 * enrichment, report generation) to the self-hosted n8n instance.
 *
 * @param webhookPath the workflow's webhook path, e.g. "invoice-reminder"
 */
export async function triggerWorkflow(webhookPath: string, payload: Record<string, unknown>) {
  if (!N8N_BASE_URL) throw new Error("N8N_BASE_URL is not set");

  const res = await fetch(`${N8N_BASE_URL}/webhook/${webhookPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // Lets the n8n workflow verify the call came from SmartOps.
      "X-SmartOps-Secret": process.env.N8N_WEBHOOK_SECRET ?? "",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`n8n workflow "${webhookPath}" failed: ${res.status} ${await res.text()}`);
  }

  return res.headers.get("content-type")?.includes("application/json") ? res.json() : res.text();
}

/** Lists workflows on the n8n instance — used by the Technology agents to report automation health. */
export async function listWorkflows() {
  if (!N8N_BASE_URL || !N8N_API_KEY) throw new Error("N8N_BASE_URL and N8N_API_KEY must be set");

  const res = await fetch(`${N8N_BASE_URL}/api/v1/workflows`, {
    headers: { "X-N8N-API-KEY": N8N_API_KEY },
  });

  if (!res.ok) throw new Error(`n8n API error: ${res.status}`);
  const body = (await res.json()) as { data: { id: string; name: string; active: boolean }[] };
  return body.data;
}
