import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TiffinForm } from "@/components/forms/tiffin-form";
import { PageHeader } from "@/components/ui/page-header";
import { getProviderTiffin } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";

export const metadata: Metadata = { title: "Edit tiffin plan" };

export default async function EditTiffinPage({ params }: { params: Promise<{ id: string }> }) {
  const { kitchen } = await requireProviderKitchen();
  const { id } = await params;
  const plan = await getProviderTiffin(kitchen.id, id);
  if (!plan) notFound();
  return (
    <>
      <PageHeader title="Edit tiffin plan" description={plan.name} />
      <section className="card p-5 sm:p-6">
        <TiffinForm plan={plan} />
      </section>
    </>
  );
}
