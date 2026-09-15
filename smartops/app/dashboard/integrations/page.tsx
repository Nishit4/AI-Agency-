import { createServiceSupabaseClient } from "@/lib/supabase";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { IntegrationsList, type IntegrationRow } from "@/components/dashboard/IntegrationsList";
import type { Integration } from "@/types";

export const dynamic = "force-dynamic";

export default async function IntegrationsPage() {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase.from("integrations").select("*").order("name");

  const rows: IntegrationRow[] = ((data ?? []) as Integration[]).map((i) => ({
    ...i,
    credential_present: i.credential_env_var ? Boolean(process.env[i.credential_env_var]) : null,
  }));

  const connected = rows.filter((r) => r.status === "connected").length;
  const pending = rows.filter((r) => r.status === "pending_approval").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Integrations</h1>
        <p className="text-sm text-slate-500">
          Managed by the Integrations Agent. {connected} connected
          {pending > 0 && `, ${pending} awaiting your approval`}. Nothing connects without your sign-off.
        </p>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
        <strong className="font-medium text-slate-900">How credentials work:</strong> secrets are never stored in the
        database or sent to an agent. Each integration names the environment variable that should hold its credential —
        you set that value in Vercel, and the app reads it at runtime.
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <IntegrationsList initial={rows} />
        </div>
        <AgentChat
          endpoint="integrations"
          title="Ask the Integrations Agent"
          placeholder="What would I need to connect to automate client onboarding?"
        />
      </div>
    </div>
  );
}
