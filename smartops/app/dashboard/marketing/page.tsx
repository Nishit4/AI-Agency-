import { createServiceSupabaseClient } from "@/lib/supabase";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { AgentChat } from "@/components/dashboard/AgentChat";
import { CalEmbed } from "@/components/dashboard/CalEmbed";
import { formatINR } from "@/lib/utils";
import type { Campaign, CampaignStatus, Lead, LeadStatus } from "@/types";

export const dynamic = "force-dynamic";

const CAMPAIGN_TONE: Record<CampaignStatus, BadgeTone> = {
  draft: "slate",
  active: "green",
  paused: "amber",
  completed: "blue",
};

const LEAD_TONE: Record<LeadStatus, BadgeTone> = {
  new: "blue",
  contacted: "amber",
  qualified: "indigo",
  converted: "green",
  lost: "red",
};

export default async function MarketingPage() {
  const supabase = createServiceSupabaseClient();
  const [{ data: campaigns }, { data: leads }] = await Promise.all([
    supabase.from("campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(25),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Marketing</h1>
        <p className="text-sm text-slate-500">Campaigns, spend, and inbound leads.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Campaigns</CardTitle>
          </CardHeader>
          {(campaigns ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No campaigns yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                    <th className="py-2 pr-4 font-medium">Campaign</th>
                    <th className="py-2 pr-4 font-medium">Channel</th>
                    <th className="py-2 pr-4 font-medium">Budget / Spent</th>
                    <th className="py-2 pr-4 font-medium">Leads</th>
                    <th className="py-2 pr-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(campaigns as Campaign[]).map((c) => (
                    <tr key={c.id} className="border-b border-slate-100 last:border-0">
                      <td className="py-3 pr-4 font-medium text-slate-900">{c.name}</td>
                      <td className="py-3 pr-4 text-slate-600">{c.channel}</td>
                      <td className="py-3 pr-4 text-slate-600">
                        {formatINR(Number(c.spent))} / {formatINR(Number(c.budget))}
                      </td>
                      <td className="py-3 pr-4 text-slate-600">{c.leads_generated}</td>
                      <td className="py-3 pr-4">
                        <Badge tone={CAMPAIGN_TONE[c.status]}>{c.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        <AgentChat endpoint="marketing" title="Ask the Marketing agents" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent leads</CardTitle>
        </CardHeader>
        {(leads ?? []).length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No leads yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">Company</th>
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {(leads as Lead[]).map((lead) => (
                  <tr key={lead.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="font-medium text-slate-900">{lead.name}</div>
                      <div className="text-xs text-slate-400">{lead.email}</div>
                    </td>
                    <td className="py-3 pr-4 text-slate-600">{lead.company ?? "—"}</td>
                    <td className="py-3 pr-4 text-slate-600">{lead.source ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <Badge tone={LEAD_TONE[lead.status]}>{lead.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Book an intro call</CardTitle>
          <span className="text-xs text-slate-400">Cal.com</span>
        </CardHeader>
        <CalEmbed calLink={process.env.NEXT_PUBLIC_CALCOM_LINK} />
      </Card>
    </div>
  );
}
