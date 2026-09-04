"use client";

import { useState } from "react";
import { ApprovalCard } from "@/components/dashboard/ApprovalCard";
import type { Approval } from "@/types";

export function ApprovalsList({ initialApprovals }: { initialApprovals: Approval[] }) {
  const [approvals, setApprovals] = useState(initialApprovals);

  function handleResolved(id: string, status: "approved" | "rejected") {
    setApprovals((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
  }

  const pending = approvals.filter((a) => a.status === "pending");
  const resolved = approvals.filter((a) => a.status !== "pending");

  if (approvals.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">No approvals yet — agents will raise them here as they work.</p>;
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Pending ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-slate-400">Nothing waiting on you right now.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} onResolved={handleResolved} />
            ))}
          </div>
        )}
      </section>

      {resolved.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Recently resolved</h2>
          <div className="space-y-4">
            {resolved.map((approval) => (
              <ApprovalCard key={approval.id} approval={approval} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
