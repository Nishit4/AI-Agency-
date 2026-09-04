import { createServiceSupabaseClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { formatINR } from "@/lib/utils";
import type { Client, Invoice } from "@/types";

// These dashboards always need live DB state (approvals, agent status,
// revenue), so they must never be statically prerendered at build time.
export const dynamic = "force-dynamic";

async function getOverviewData() {
  const supabase = createServiceSupabaseClient();

  const [{ count: pendingApprovals }, { data: clients }, { data: invoices }, { count: erroredAgents }] =
    await Promise.all([
      supabase.from("approvals").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("clients").select("*").eq("status", "active"),
      supabase.from("invoices").select("*").eq("status", "paid"),
      supabase.from("agents").select("*", { count: "exact", head: true }).eq("status", "error"),
    ]);

  const activeClients = (clients ?? []) as Client[];
  const paidInvoices = (invoices ?? []) as Invoice[];

  const mrr = activeClients.reduce((sum, c) => sum + Number(c.plan_amount), 0);

  const byMonth = new Map<string, number>();
  for (const inv of paidInvoices) {
    if (!inv.paid_at) continue;
    const month = new Date(inv.paid_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    byMonth.set(month, (byMonth.get(month) ?? 0) + Number(inv.amount));
  }
  const revenueData: RevenuePoint[] = Array.from(byMonth.entries()).map(([month, revenue]) => ({ month, revenue }));

  return {
    pendingApprovals: pendingApprovals ?? 0,
    activeClientCount: activeClients.length,
    mrr,
    erroredAgents: erroredAgents ?? 0,
    revenueData,
  };
}

export default async function DashboardOverviewPage() {
  const { pendingApprovals, activeClientCount, mrr, erroredAgents, revenueData } = await getOverviewData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Overview</h1>
        <p className="text-sm text-slate-500">Everything the CEO needs to see at a glance.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Pending approvals</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{pendingApprovals}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Active clients</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{activeClientCount}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">MRR</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{formatINR(mrr)}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Agents in error</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{erroredAgents}</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue (paid invoices)</CardTitle>
          </CardHeader>
          <RevenueChart data={revenueData} />
        </Card>

        <AgentChat endpoint="assistant" title="Ask the SmartOps Assistant" />
      </div>
    </div>
  );
}
