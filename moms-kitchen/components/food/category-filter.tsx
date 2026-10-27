import Link from "next/link";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/types";

/** Category chips. Builds links that keep the other search filters. */
export function CategoryFilter({
  categories,
  active,
  baseParams = {},
}: {
  categories: CategoryDTO[];
  active?: string;
  baseParams?: Record<string, string | undefined>;
}) {
  function href(slug?: string) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(baseParams)) {
      if (value && key !== "category") params.set(key, value);
    }
    if (slug) params.set("category", slug);
    const query = params.toString();
    return `/kitchens${query ? `?${query}` : ""}`;
  }

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link
        href={href()}
        className={cn(
          "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition",
          !active ? "border-brand-600 bg-brand-600 text-white" : "border-orange-200 bg-white hover:bg-brand-50",
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={href(category.slug)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
            active === category.slug
              ? "border-brand-600 bg-brand-600 text-white"
              : "border-orange-200 bg-white hover:bg-brand-50",
          )}
        >
          <span aria-hidden>{category.emoji}</span>
          {category.name}
        </Link>
      ))}
    </div>
  );
}
