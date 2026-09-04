import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { formatINR } from "@/lib/utils";
import type { Client, ClientStatus } from "@/types";

const STATUS_TONE: Record<ClientStatus, BadgeTone> = {
  lead: "slate",
  onboarding: "amber",
  active: "green",
  paused: "blue",
  churned: "red",
};

export function ClientTable({ clients }: { clients: Client[] }) {
  if (clients.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No clients yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 pr-4 font-medium">Client</th>
            <th className="py-2 pr-4 font-medium">Plan</th>
            <th className="py-2 pr-4 font-medium">Amount</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Since</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="border-b border-slate-100 last:border-0">
              <td className="py-3 pr-4">
                <div className="font-medium text-slate-900">{client.company}</div>
                <div className="text-xs text-slate-400">{client.name} · {client.email}</div>
              </td>
              <td className="py-3 pr-4 text-slate-600">{client.plan_name}</td>
              <td className="py-3 pr-4 font-medium text-slate-900">{formatINR(client.plan_amount)}</td>
              <td className="py-3 pr-4">
                <Badge tone={STATUS_TONE[client.status]}>{client.status}</Badge>
              </td>
              <td className="py-3 pr-4 text-slate-500">
                {client.onboarded_at ? new Date(client.onboarded_at).toLocaleDateString("en-IN") : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
