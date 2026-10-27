import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FoodForm } from "@/components/forms/food-form";
import { PageHeader } from "@/components/ui/page-header";
import { getAllCategories, getProviderFood } from "@/lib/data/provider";
import { requireProviderKitchen } from "@/lib/provider-context";

export const metadata: Metadata = { title: "Edit dish" };

export default async function EditFoodPage({ params }: { params: Promise<{ id: string }> }) {
  const { kitchen } = await requireProviderKitchen();
  const { id } = await params;
  const [food, categories] = await Promise.all([getProviderFood(kitchen.id, id), getAllCategories()]);
  // Providers can only edit dishes from their own kitchen
  if (!food) notFound();
  return (
    <>
      <PageHeader title="Edit dish" description={food.name} />
      <section className="card p-5 sm:p-6">
        <FoodForm food={food} categories={categories} />
      </section>
    </>
  );
}
