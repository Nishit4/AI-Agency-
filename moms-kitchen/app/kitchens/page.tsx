import { MapPin, Search, SlidersHorizontal } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { CategoryFilter } from "@/components/food/category-filter";
import { KitchenGrid } from "@/components/kitchen/kitchen-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getCategories, getCities, searchKitchens, type KitchenFilters } from "@/lib/data/public";

export const metadata: Metadata = { title: "Browse home kitchens" };

type SearchParams = {
  q?: string;
  category?: string;
  city?: string;
  pincode?: string;
  veg?: string;
  sort?: string;
  welcome?: string;
};

export default async function KitchensPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const filters: KitchenFilters = {
    q: params.q?.trim() || undefined,
    category: params.category || undefined,
    city: params.city || undefined,
    pincode: params.pincode?.trim() || undefined,
    veg: params.veg === "1",
    sort: params.sort === "newest" || params.sort === "name" ? params.sort : "rating",
  };

  const [kitchens, categories, cities] = await Promise.all([
    searchKitchens(filters),
    getCategories(),
    getCities(),
  ]);
  const activeCategory = categories.find((c) => c.slug === filters.category);
  const hasFilters = Boolean(filters.q || filters.category || filters.city || filters.pincode || filters.veg);

  return (
    <div className="container-page py-8">
      {params.welcome && (
        <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          🎉 Welcome to Mom&apos;s Kitchen! Find a kitchen you like and place your first order.
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          {activeCategory ? `${activeCategory.emoji} ${activeCategory.name} home kitchens` : "Home kitchens near you"}
        </h1>
        <p className="mt-1 text-stone-600">
          {kitchens.length} kitchen{kitchens.length === 1 ? "" : "s"} found
          {filters.city ? ` in ${filters.city}` : ""}
          {filters.pincode ? ` serving ${filters.pincode}` : ""}
        </p>
      </div>

      {/* Search + filters (plain GET form: works even without JavaScript) */}
      <form action="/kitchens" className="card mb-5 p-3 sm:p-4">
        {filters.category && <input type="hidden" name="category" value={filters.category} />}
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_180px_160px_auto]">
          <label className="relative">
            <span className="sr-only">Search</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input name="q" defaultValue={filters.q} placeholder="Dish, kitchen or area" className="input pl-9" />
          </label>
          <label className="relative">
            <span className="sr-only">Pincode or area</span>
            <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input name="pincode" defaultValue={filters.pincode} placeholder="Pincode / area" className="input pl-9" />
          </label>
          <label>
            <span className="sr-only">City</span>
            <select name="city" defaultValue={filters.city ?? ""} className="input">
              <option value="">All cities</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="btn-primary">
            <Search className="h-4 w-4" /> Search
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="veg" value="1" defaultChecked={filters.veg} className="h-4 w-4 rounded border-orange-300 text-brand-600" />
            🌱 Pure veg only
          </label>
          <label className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-stone-500" />
            <span className="sr-only">Sort by</span>
            <select name="sort" defaultValue={filters.sort} className="rounded-lg border border-orange-200 bg-white px-2 py-1 text-sm">
              <option value="rating">Top rated</option>
              <option value="newest">Newest</option>
              <option value="name">Name (A–Z)</option>
            </select>
          </label>
          {hasFilters && (
            <Link href="/kitchens" className="ml-auto font-medium text-brand-700 hover:underline">
              Clear filters
            </Link>
          )}
        </div>
      </form>

      <div className="mb-6">
        <CategoryFilter
          categories={categories}
          active={filters.category}
          baseParams={{ q: filters.q, city: filters.city, pincode: filters.pincode, veg: filters.veg ? "1" : undefined, sort: params.sort }}
        />
      </div>

      {kitchens.length ? (
        <KitchenGrid kitchens={kitchens} />
      ) : (
        <EmptyState
          emoji="🔍"
          title="No kitchens match your search"
          description="Try a different dish, remove some filters, or check another pincode."
          actionHref="/kitchens"
          actionLabel="Show all kitchens"
        />
      )}
    </div>
  );
}
