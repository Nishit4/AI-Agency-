import { Search, Trash2 } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { ActionButton } from "@/components/ui/action-button";
import { Badge, VegMark } from "@/components/ui/badges";
import { PageHeader } from "@/components/ui/page-header";
import { adminDeleteFood, adminToggleFood } from "@/lib/actions/admin";
import { listFoods } from "@/lib/data/admin";
import { requireUser } from "@/lib/session";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Listings" };

export default async function AdminListingsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireUser(["ADMIN"]);
  const { q } = await searchParams;
  const foods = await listFoods(q?.trim());

  return (
    <>
      <PageHeader title="Food listings" description="Moderate dishes published by home cooks." />
      <form className="card mb-5 flex gap-3 p-3">
        <label className="relative flex-1">
          <span className="sr-only">Search dishes</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input name="q" defaultValue={q} placeholder="Search dishes" className="input pl-9" />
        </label>
        <button type="submit" className="btn-primary">Search</button>
      </form>
      <div className="card p-2 sm:p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Dish</th>
                <th>Kitchen</th>
                <th>Category</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {foods.map((food) => (
                <tr key={food.id}>
                  <td>
                    <span className="flex items-center gap-2 font-medium">
                      <VegMark isVeg={food.isVeg} /> {food.name}
                    </span>
                  </td>
                  <td>
                    <Link href={`/kitchens/${food.kitchenId}`} className="text-brand-700 hover:underline">{food.kitchenName}</Link>
                  </td>
                  <td>{food.category ? `${food.category.emoji} ${food.category.name}` : "—"}</td>
                  <td className="font-semibold">{formatPrice(food.price)}</td>
                  <td>
                    <Badge className={food.isAvailable ? "bg-green-100 text-green-800" : "bg-stone-200 text-stone-700"}>
                      {food.isAvailable ? "Listed" : "Hidden"}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex justify-end gap-2">
                      <ActionButton action={adminToggleFood.bind(null, food.id)} className="btn-secondary btn-sm">
                        {food.isAvailable ? "Hide" : "List"}
                      </ActionButton>
                      <ActionButton
                        action={adminDeleteFood.bind(null, food.id)}
                        confirmMessage={`Remove "${food.name}" permanently?`}
                        className="btn-ghost btn-sm text-red-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {foods.length === 0 && <p className="p-4 text-center text-sm text-stone-600">No dishes found.</p>}
      </div>
    </>
  );
}
