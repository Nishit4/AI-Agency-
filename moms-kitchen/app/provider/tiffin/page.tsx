import { Pencil, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { deleteTiffin, toggleTiffinAvailability } from "@/lib/actions/provider";
import { TIFFIN_FREQUENCY_LABEL } from "@/lib/constants";
import { getProviderTiffins } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Tiffin plans" };

export default async function ProviderTiffinPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { kitchen } = await requireProviderKitchen();
  const [plans, { saved }] = await Promise.all([getProviderTiffins(kitchen.id), searchParams]);

  return (
    <>
      <PageHeader
        title="Tiffin plans"
        description="Offer daily, weekly or monthly meal plans."
        actions={<Link href="/provider/tiffin/new" className="btn-primary">+ Add plan</Link>}
      />
      {saved && (
        <div className="mb-4 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm text-green-800">Tiffin plan saved successfully.</div>
      )}
      {plans.length === 0 ? (
        <EmptyState emoji="🍱" title="No tiffin plans yet" description="Regular tiffin plans help you get repeat customers." actionHref="/provider/tiffin/new" actionLabel="Create a plan" />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {plans.map((plan) => (
            <article key={plan.id} className="card flex flex-col p-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-brand-100 text-brand-800">{TIFFIN_FREQUENCY_LABEL[plan.frequency]}</Badge>
                <Badge className={plan.isAvailable ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}>
                  {plan.isAvailable ? "Available" : "Unavailable"}
                </Badge>
              </div>
              <h3 className="mt-2 text-lg font-bold">{plan.name}</h3>
              <p className="text-xl font-bold text-brand-700">{formatPrice(plan.price)}</p>
              <p className="mt-2 text-sm text-stone-600">{plan.meals}</p>
              {plan.description && <p className="mt-1 text-sm text-stone-500">{plan.description}</p>}
              <div className="mt-auto flex flex-wrap gap-2 pt-4">
                <ActionButton action={toggleTiffinAvailability.bind(null, plan.id)} className="btn-secondary btn-sm">
                  {plan.isAvailable ? "Mark unavailable" : "Mark available"}
                </ActionButton>
                <Link href={`/provider/tiffin/${plan.id}/edit`} className="btn-secondary btn-sm">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                <ActionButton
                  action={deleteTiffin.bind(null, plan.id)}
                  confirmMessage={`Delete "${plan.name}"?`}
                  className="btn-ghost btn-sm text-red-600"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </ActionButton>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
