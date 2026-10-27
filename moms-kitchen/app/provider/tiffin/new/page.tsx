import type { Metadata } from "next";
import { TiffinForm } from "@/components/forms/tiffin-form";
import { PageHeader } from "@/components/ui/page-header";
import { requireProviderKitchen } from "@/lib/provider-context";

export const metadata: Metadata = { title: "Add tiffin plan" };

export default async function NewTiffinPage() {
  await requireProviderKitchen();
  return (
    <>
      <PageHeader title="Add a tiffin plan" description="Daily, weekly or monthly meal plans for regular customers." />
      <section className="card p-5 sm:p-6">
        <TiffinForm plan={null} />
      </section>
    </>
  );
}
