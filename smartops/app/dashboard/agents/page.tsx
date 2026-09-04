import { createServiceSupabaseClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { AgentStatusBadge } from "@/components/dashboard/AgentStatusBadge";
import type { AgentStatus, Department } from "@/types";

const DEPARTMENTS: { key: Department; label: string }[] = [
  { key: "operations", label: "Operations" },
  { key: "technology", label: "Technology" },
  { key: "finance", label: "Finance" },
  { key: "marketing", label: "Marketing" },
];

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase.from("agents").select("*").order("name", { ascending: true });
  const agents = (data ?? []) as AgentStatus[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Agents</h1>
        <p className="text-sm text-slate-500">Live status of all 15 AI agents across 4 departments.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {DEPARTMENTS.map(({ key, label }) => {
          const deptAgents = agents.filter((a) => a.department === key);
          return (
            <Card key={key}>
              <CardHeader>
                <CardTitle>{label}</CardTitle>
                <span className="text-xs text-slate-400">{deptAgents.length} agents</span>
              </CardHeader>
              <ul className="divide-y divide-slate-100">
                {deptAgents.map((agent) => (
                  <li key={agent.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{agent.name}</p>
                      <p className="text-xs text-slate-400">{agent.role}</p>
                      {agent.last_run_at && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          Last run: {new Date(agent.last_run_at).toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                    <AgentStatusBadge status={agent.status} />
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
