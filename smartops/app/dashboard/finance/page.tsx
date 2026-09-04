import { createServiceSupabaseClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { RevenueChart, type RevenuePoint } from "@/components/dashboard/RevenueChart";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { formatINR } from "@/lib/utils";
import type { Invoice, InvoiceStatus } from "@/types";

export const dynamic = "force-dynamic";

const STATUS_TONE: Record<InvoiceStatus, BadgeTone> = {
  draft: "slate",
  sent: "blue",
  paid: "green",
  overdue: "red",
  cancelled: "slate",
};

export default async function FinancePage() {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase
    .from("invoices")
    .select("*, clients(company)")
    .order("created_at", { ascending: false })
    .limit(25);

  const invoices = (data ?? []) as (Invoice & { clients: { company: string } | null })[];

  const paid = invoices.filter((i) => i.status === "paid");
  const byMonth = new Map<string, number>();
  for (const inv of paid) {
    if (!inv.paid_at) continue;
    const month = new Date(inv.paid_at).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
    byMonth.set(month, (byMonth.get(month) ?? 0) + Number(inv.amount));
  }
  const revenueData: RevenuePoint[] = Array.from(byMonth.entries()).map(([month, revenue]) => ({ month, revenue }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Finance</h1>
        <p className="text-sm text-slate-500">Revenue, billing and invoice status via Razorpay.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
          </CardHeader>
          <RevenueChart data={revenueData} />
        </Card>
        <AgentChat endpoint="finance" title="Ask the Finance agents" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
        </CardHeader>
        {invoices.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-medium">Client</th>
                  <th className="py-2 pr-4 font-medium">Amount</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Due</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-slate-900">{inv.clients?.company ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{formatINR(Number(inv.amount))}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={STATUS_TONE[inv.status]}>{inv.status}</Badge>
                    </td>
                    <td className="py-3 pr-4 text-slate-500">
                      {new Date(inv.due_date).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
