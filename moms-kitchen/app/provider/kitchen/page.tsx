import type { Metadata } from "next";
import Link from "next/link";
import { KitchenForm } from "@/components/forms/kitchen-form";
import { ActionButton } from "@/components/ui/action-button";
import { KitchenStatusBadge, OpenBadge } from "@/components/ui/badges";
import { PageHeader } from "@/components/ui/page-header";
import { toggleKitchenOpen } from "@/lib/actions/provider";
import { getProviderKitchen } from "@/lib/data/provider";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Kitchen profile" };

const STATUS_HELP = {
  PENDING: "Your kitchen is waiting for admin approval. You can add your menu meanwhile — customers will see it once approved.",
  APPROVED: "Your kitchen is live! Customers can find it and place orders.",
  REJECTED: "Your kitchen was not approved. Update your details and save to send it for review again.",
  SUSPENDED: "Your kitchen has been suspended by the admin. Please contact support.",
};

export default async function ProviderKitchenPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const user = await requireUser(["PROVIDER"]);
  const [kitchen, { welcome }] = await Promise.all([getProviderKitchen(user.id), searchParams]);

  return (
    <>
      {welcome && !kitchen && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 text-green-900">
          <p className="font-bold">👩‍🍳 Welcome, {user.name.split(" ")[0]}!</p>
          <p className="text-sm">Start by creating your kitchen profile. After an admin approves it, customers can order from you.</p>
        </div>
      )}
      <PageHeader
        title={kitchen ? "Kitchen profile" : "Create your kitchen"}
        description={kitchen ? "This is what customers see on your kitchen page." : "Tell customers about your home kitchen."}
        actions={kitchen && kitchen.status === "APPROVED" ? <Link href={`/kitchens/${kitchen.id}`} className="btn-secondary">View public page</Link> : kitchen ? <Link href={`/kitchens/${kitchen.id}`} className="btn-secondary">Preview page</Link> : null}
      />

      {kitchen && (
        <section className="card mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <KitchenStatusBadge status={kitchen.status} />
              <OpenBadge isOpen={kitchen.isOpen} />
            </div>
            <p className="text-sm text-stone-600">{STATUS_HELP[kitchen.status]}</p>
          </div>
          <ActionButton action={toggleKitchenOpen} className={kitchen.isOpen ? "btn-secondary" : "btn-success"}>
            {kitchen.isOpen ? "Close kitchen for orders" : "Open kitchen for orders"}
          </ActionButton>
        </section>
      )}

      <section className="card p-5 sm:p-6">
        <KitchenForm kitchen={kitchen} />
      </section>
    </>
  );
}
