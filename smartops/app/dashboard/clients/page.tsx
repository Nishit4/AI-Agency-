import { createServiceSupabaseClient } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { ClientTable } from "@/components/dashboard/ClientTable";
import type { Client } from "@/types";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const supabase = createServiceSupabaseClient();
  const { data } = await supabase.from("clients").select("*").order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Clients</h1>
        <p className="text-sm text-slate-500">All leads, onboarding and active engagements.</p>
      </div>

      <Card>
        <ClientTable clients={(data ?? []) as Client[]} />
      </Card>
    </div>
  );
}
