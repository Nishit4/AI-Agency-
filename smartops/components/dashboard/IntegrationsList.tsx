"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Integration, IntegrationStatus } from "@/types";

export type IntegrationRow = Integration & { credential_present: boolean | null };

const STATUS_TONE: Record<IntegrationStatus, BadgeTone> = {
  available: "slate",
  pending_approval: "amber",
  connected: "green",
  disabled: "slate",
  error: "red",
};

const STATUS_LABEL: Record<IntegrationStatus, string> = {
  available: "Not connected",
  pending_approval: "Awaiting your approval",
  connected: "Connected",
  disabled: "Disabled",
  error: "Needs attention",
};

export function IntegrationsList({ initial }: { initial: IntegrationRow[] }) {
  const [rows, setRows] = useState(initial);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(null);

  async function request(row: IntegrationRow) {
    setBusy(row.id);
    setNotice(null);
    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "request", integration_id: row.id }),
      });
      const data = await res.json();
      if (res.ok) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "pending_approval" } : r)));
        setNotice({ id: row.id, text: data.message });
      } else {
        setNotice({ id: row.id, text: data.error });
      }
    } finally {
      setBusy(null);
    }
  }

  async function disconnect(row: IntegrationRow) {
    setBusy(row.id);
    setNotice(null);
    try {
      const res = await fetch("/api/integrations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disconnect", integration_id: row.id }),
      });
      if (res.ok) {
        setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, status: "disabled" } : r)));
        setNotice({ id: row.id, text: `${row.name} disconnected.` });
      }
    } finally {
      setBusy(null);
    }
  }

  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        No integrations in the catalog — re-run <code className="rounded bg-slate-100 px-1 text-xs">schema.sql</code>.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {rows.map((row) => (
        <Card key={row.id}>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-slate-900">{row.name}</h3>
            <Badge tone="blue">{row.kind.toUpperCase()}</Badge>
            <Badge tone={STATUS_TONE[row.status]} className="ml-auto">
              {STATUS_LABEL[row.status]}
            </Badge>
          </div>

          <p className="mb-3 text-sm text-slate-600">{row.description}</p>

          <dl className="mb-4 space-y-1 text-xs text-slate-500">
            {row.scopes.length > 0 && (
              <div className="flex gap-2">
                <dt className="shrink-0 font-medium">Scopes</dt>
                <dd>{row.scopes.join(", ")}</dd>
              </div>
            )}
            {row.credential_env_var && (
              <div className="flex gap-2">
                <dt className="shrink-0 font-medium">Credential</dt>
                <dd>
                  <code className="rounded bg-slate-100 px-1">{row.credential_env_var}</code>{" "}
                  {row.credential_present === false && <span className="text-amber-600">— not set in environment</span>}
                  {row.credential_present === true && <span className="text-emerald-600">— present</span>}
                </dd>
              </div>
            )}
            {row.last_error && (
              <div className="flex gap-2 text-red-600">
                <dt className="shrink-0 font-medium">Error</dt>
                <dd>{row.last_error}</dd>
              </div>
            )}
          </dl>

          <div className="flex gap-2">
            {row.status === "connected" ? (
              <Button variant="secondary" onClick={() => disconnect(row)} disabled={busy === row.id}>
                {busy === row.id ? "Disconnecting…" : "Disconnect"}
              </Button>
            ) : row.status === "pending_approval" ? (
              <Button variant="secondary" disabled>
                Waiting on your approval
              </Button>
            ) : (
              <Button onClick={() => request(row)} disabled={busy === row.id}>
                {busy === row.id ? "Requesting…" : "Request connection"}
              </Button>
            )}
          </div>

          {notice?.id === row.id && <p className="mt-3 text-xs text-slate-500">{notice.text}</p>}
        </Card>
      ))}
    </div>
  );
}
