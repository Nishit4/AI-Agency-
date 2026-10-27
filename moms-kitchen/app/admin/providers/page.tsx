import type { Metadata } from "next";
import Link from "next/link";
import { ApprovalPanel } from "@/components/approval-panel";
import { KitchenStatusBadge } from "@/components/ui/badges";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";
import { RatingPill } from "@/components/ui/rating";
import { Tabs } from "@/components/ui/tabs";
import { listKitchens } from "@/lib/data/admin";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { KITCHEN_STATUSES, type KitchenStatus } from "@/types";

export const metadata: Metadata = { title: "Providers" };

export default async function AdminProvidersPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireUser(["ADMIN"]);
  const { status: raw } = await searchParams;
  const status = KITCHEN_STATUSES.includes(raw as KitchenStatus) ? (raw as KitchenStatus) : "";
  const kitchens = await listKitchens(status);

  return (
    <>
      <PageHeader title="Providers & kitchens" description="Approve new home cooks and manage existing kitchens." />
      <Tabs
        active={status || "ALL"}
        tabs={[
          { key: "ALL", label: "All", href: "/admin/providers" },
          { key: "PENDING", label: "Pending", href: "/admin/providers?status=PENDING" },
          { key: "APPROVED", label: "Approved", href: "/admin/providers?status=APPROVED" },
          { key: "REJECTED", label: "Rejected", href: "/admin/providers?status=REJECTED" },
          { key: "SUSPENDED", label: "Suspended", href: "/admin/providers?status=SUSPENDED" },
        ]}
      />
      {kitchens.length === 0 ? (
        <EmptyState emoji="🏠" title="No kitchens found" />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {kitchens.map((kitchen) => (
            <article key={kitchen.id} className="card flex flex-col p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/kitchens/${kitchen.id}`} className="text-lg font-bold hover:text-brand-700">
                    {kitchen.kitchenName}
                  </Link>
                  <p className="text-sm text-stone-600">
                    Owner: {kitchen.ownerName} · {kitchen.phone}
                  </p>
                </div>
                <KitchenStatusBadge status={kitchen.status} />
              </div>
              <p className="mt-2 line-clamp-2 text-sm text-stone-600">{kitchen.description}</p>
              <dl className="mt-3 grid gap-1 text-xs text-stone-500">
                <div>📍 {kitchen.address.line}, {kitchen.address.area}, {kitchen.address.city} – {kitchen.address.pincode}</div>
                <div>🚚 Serves: {kitchen.serviceAreas.join(", ") || "—"}</div>
                <div>📅 Joined {formatDate(kitchen.createdAt)}</div>
              </dl>
              <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-4">
                <RatingPill rating={kitchen.rating} count={kitchen.ratingCount} />
                <ApprovalPanel kitchenId={kitchen.id} status={kitchen.status} />
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
