import { createServiceSupabaseClient } from "@/lib/supabase";
import { ApprovalsList } from "@/components/dashboard/ApprovalsList";
import type { Approval } from "@/types";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase.from("approvals").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Approvals</h1>
        <p className="text-sm text-slate-500">Every action an agent flagged as needing your sign-off.</p>
      </div>

      <ApprovalsList initialApprovals={(data ?? []) as Approval[]} />
    </div>
  );
}
