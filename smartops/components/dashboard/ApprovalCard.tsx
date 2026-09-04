"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { Approval } from "@/types";

const DEPARTMENT_TONE = {
  operations: "indigo",
  technology: "blue",
  finance: "green",
  marketing: "amber",
} as const;

export function ApprovalCard({
  approval,
  onResolved,
}: {
  approval: Approval;
  onResolved?: (id: string, status: "approved" | "rejected") => void;
}) {
  const [loading, setLoading] = useState<"approved" | "rejected" | null>(null);

  async function resolve(status: "approved" | "rejected") {
    setLoading(status);
    try {
      const res = await fetch("/api/approvals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: approval.id, status, resolved_by: "CEO" }),
      });
      if (res.ok) onResolved?.(approval.id, status);
    } finally {
      setLoading(null);
    }
  }

  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <Badge tone={DEPARTMENT_TONE[approval.department]}>{approval.department}</Badge>
        <span className="text-xs text-slate-400">{approval.agent_name}</span>
        <span className="ml-auto text-xs text-slate-400">
          {new Date(approval.created_at).toLocaleString("en-IN")}
        </span>
      </div>
      <h4 className="mb-1 font-semibold text-slate-900">{approval.title}</h4>
      <p className="mb-4 whitespace-pre-wrap text-sm text-slate-600">{approval.description}</p>

      {approval.status === "pending" ? (
        <div className="flex gap-2">
          <Button variant="primary" onClick={() => resolve("approved")} disabled={loading !== null}>
            {loading === "approved" ? "Approving…" : "Approve"}
          </Button>
          <Button variant="danger" onClick={() => resolve("rejected")} disabled={loading !== null}>
            {loading === "rejected" ? "Rejecting…" : "Reject"}
          </Button>
        </div>
      ) : (
        <Badge tone={approval.status === "approved" ? "green" : "red"}>{approval.status}</Badge>
      )}
    </Card>
  );
}
