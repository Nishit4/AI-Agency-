import type { Metadata } from "next";
import { FoodForm } from "@/components/forms/food-form";
import { PageHeader } from "@/components/ui/page-header";
import { getAllCategories } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";

export const metadata: Metadata = { title: "Add dish" };

export default async function NewFoodPage() {
  await requireProviderKitchen();
  const categories = await getAllCategories();
  return (
    <>
      <PageHeader title="Add a dish" description="Publish a new item on your menu." />
      <section className="card p-5 sm:p-6">
        <FoodForm food={null} categories={categories} />
      </section>
    </>
  );
}
