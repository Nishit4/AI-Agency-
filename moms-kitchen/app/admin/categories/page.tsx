import { Trash2 } from "lucide-react";
import type { Metadata } from "next";
import { CategoryForm } from "@/components/forms/category-form";
import { ActionButton } from "@/components/ui/action-button";
import { PageHeader } from "@/components/ui/page-header";
import { deleteCategory } from "@/lib/actions/admin";
import { listCategoriesWithCounts } from "@/lib/data/admin";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireUser(["ADMIN"]);
  const categories = await listCategoriesWithCounts();

  return (
    <>
      <PageHeader title="Categories" description="Cuisines customers use to discover food." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <ul className="space-y-3">
          {categories.map((category) => (
            <li key={category.id} className="card p-4">
              <details>
                <summary className="flex cursor-pointer list-none items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-2xl" aria-hidden>
                    {category.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold">{category.name}</span>
                    <span className="block truncate text-xs text-stone-500">
                      {category.foodCount} dish(es) · {category.description || "No description"}
                    </span>
                  </span>
                  <span className="text-xs font-semibold text-brand-700">Edit</span>
                </summary>
                <div className="mt-4 border-t border-orange-50 pt-4">
                  <CategoryForm category={category} />
                  <div className="mt-3 border-t border-orange-50 pt-3">
                    <ActionButton
                      action={deleteCategory.bind(null, category.id)}
                      confirmMessage={`Delete category "${category.name}"?`}
                      className="btn-ghost btn-sm text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete category
                    </ActionButton>
                  </div>
                </div>
              </details>
            </li>
          ))}
        </ul>
        <section className="card h-fit p-5">
          <h2 className="mb-3 text-lg font-bold">Add category</h2>
          <CategoryForm />
        </section>
      </div>
    </>
  );
}
