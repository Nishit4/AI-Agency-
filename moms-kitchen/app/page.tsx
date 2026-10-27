import { ArrowRight, BadgeCheck, HandPlatter, MapPin, Search, ShieldCheck, Truck, Wallet } from "lucide-react";
import Link from "next/link";
import { FoodGrid } from "@/components/food/food-card";
import { KitchenGrid } from "@/components/kitchen/kitchen-card";
import {
  getCategories,
  getCities,
  getPlatformStats,
  getPopularFoods,
  getPopularKitchens,
} from "@/lib/data/public";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

const STEPS = [
  { emoji: "🔍", title: "Find a kitchen", text: "Search by dish, cuisine or your pincode to discover home cooks near you." },
  { emoji: "🍛", title: "Pick your meal", text: "Browse daily menus and tiffin plans with clear prices and veg labels." },
  { emoji: "🛒", title: "Order in a tap", text: "Add to cart, choose your address and pay cash on delivery." },
  { emoji: "🚚", title: "Track & enjoy", text: "Follow your order from kitchen to doorstep, then leave a review." },
];

export default async function HomePage() {
  const [user, categories, kitchens, foods, stats, cities] = await Promise.all([
    getCurrentUser(),
    getCategories(),
    getPopularKitchens(6),
    getPopularFoods(8),
    getPlatformStats(),
    getCities(),
  ]);
  const canOrder = !user || user.role === "CUSTOMER";

  return (
    <>
      {/* Hero + search */}
      <section className="relative overflow-hidden bg-gradient-to-b from-orange-100/70 via-cream to-cream">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" />
        <div className="pointer-events-none absolute -left-24 top-40 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="container-page relative grid grid-cols-1 items-center gap-10 py-12 sm:py-16 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:py-20">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-brand-800">
              <BadgeCheck className="h-4 w-4" /> Verified home cooks · Made fresh daily
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              Fresh Homemade Food,{" "}
              <span className="text-brand-600">From Local Kitchens</span>
            </h1>
            <p className="mt-5 max-w-xl text-base text-stone-600 sm:text-lg">
              Order ghar ka khana and daily tiffins from home cooks in your neighbourhood — the comfort of
              mom&apos;s cooking, delivered to your door.
            </p>

            <form action="/kitchens" className="mt-8 rounded-2xl border border-orange-100 bg-white p-2 shadow-card">
              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="flex flex-1 items-center gap-2 rounded-xl px-3">
                  <Search className="h-5 w-5 shrink-0 text-brand-600" />
                  <span className="sr-only">Search dishes or kitchens</span>
                  <input
                    name="q"
                    placeholder="Search thali, dosa, khichdi…"
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  />
                </label>
                <label className="flex items-center gap-2 rounded-xl px-3 sm:w-44 sm:border-l sm:border-orange-100">
                  <MapPin className="h-5 w-5 shrink-0 text-brand-600" />
                  <span className="sr-only">Pincode or area</span>
                  <input
                    name="pincode"
                    placeholder="Pincode / area"
                    className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-stone-400"
                  />
                </label>
                <button type="submit" className="btn-primary h-12 px-6">
                  Find food
                </button>
              </div>
            </form>

            {cities.length > 0 && (
              <p className="mt-3 text-sm text-stone-600">
                Now serving:{" "}
                {cities.map((city, index) => (
                  <span key={city}>
                    <Link href={`/kitchens?city=${encodeURIComponent(city)}`} className="font-semibold text-brand-700 hover:underline">
                      {city}
                    </Link>
                    {index < cities.length - 1 && ", "}
                  </span>
                ))}
              </p>
            )}

            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                { label: "Home kitchens", value: stats.kitchens },
                { label: "Homemade dishes", value: stats.dishes },
                { label: "Meals delivered", value: stats.delivered },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="text-xs text-stone-500">{item.label}</dt>
                  <dd className="font-display text-2xl font-bold text-ink sm:text-3xl">{item.value}+</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Hero visual */}
          <div className="relative mx-auto hidden w-full max-w-md sm:block lg:max-w-none">
            <div className="grid grid-cols-2 gap-4">
              {[
                { emoji: "🍱", label: "Daily tiffins", bg: "from-orange-200 to-amber-100", tall: true },
                { emoji: "🫓", label: "Gujarati", bg: "from-amber-200 to-yellow-50" },
                { emoji: "🥗", label: "Healthy", bg: "from-lime-200 to-green-50" },
                { emoji: "🥞", label: "South Indian", bg: "from-rose-200 to-orange-50", tall: true },
              ].map((tile, index) => (
                <div
                  key={tile.label}
                  className={`flex flex-col items-center justify-center rounded-3xl bg-gradient-to-br ${tile.bg} p-6 shadow-card ${
                    tile.tall ? "aspect-[4/5]" : "aspect-square"
                  } ${index % 2 === 1 ? "translate-y-6" : ""}`}
                >
                  <span className="text-6xl drop-shadow sm:text-7xl" aria-hidden>
                    {tile.emoji}
                  </span>
                  <span className="mt-3 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-ink">{tile.label}</span>
                </div>
              ))}
            </div>
            <div className="absolute -bottom-2 left-1/2 w-[85%] -translate-x-1/2 rounded-2xl border border-orange-100 bg-white p-3 shadow-lg sm:w-72">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-xl">👩‍🍳</span>
                <div className="text-sm">
                  <p className="font-semibold">Meena aunty accepted your order</p>
                  <p className="text-xs text-stone-500">Gujarati Lunch Tiffin · Preparing now</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-12">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">What are you craving?</h2>
            <p className="mt-1 text-sm text-stone-600">Explore home-style food by cuisine</p>
          </div>
          <Link href="/kitchens" className="hidden text-sm font-semibold text-brand-700 hover:underline sm:block">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/kitchens?category=${category.slug}`}
              className="card flex flex-col items-center gap-2 p-4 text-center transition hover:-translate-y-0.5 hover:border-brand-300"
            >
              <span className="text-4xl" aria-hidden>
                {category.emoji}
              </span>
              <span className="text-sm font-semibold">{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular kitchens */}
      <section className="container-page py-8">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 className="section-title">Popular home kitchens</h2>
            <p className="mt-1 text-sm text-stone-600">Loved by customers in your city</p>
          </div>
          <Link href="/kitchens" className="flex items-center gap-1 text-sm font-semibold text-brand-700 hover:underline">
            See all <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <KitchenGrid kitchens={kitchens} />
      </section>

      {/* Popular food */}
      <section className="container-page py-12">
        <div className="mb-6">
          <h2 className="section-title">Popular homemade food</h2>
          <p className="mt-1 text-sm text-stone-600">Most ordered dishes this week</p>
        </div>
        <FoodGrid foods={foods} canOrder={canOrder} />
      </section>

      {/* How it works */}
      <section className="bg-white py-14">
        <div className="container-page">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="section-title">How it works</h2>
            <p className="mt-2 text-stone-600">From a home kitchen near you to your plate, in four simple steps.</p>
          </div>
          <ol className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative rounded-2xl border border-orange-100 bg-cream p-6">
                <span className="absolute right-4 top-4 font-display text-4xl font-bold text-orange-100">{index + 1}</span>
                <span className="text-4xl" aria-hidden>
                  {step.emoji}
                </span>
                <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
                <p className="mt-1 text-sm text-stone-600">{step.text}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: "Admin-verified cooks", text: "Every kitchen is reviewed before it goes live." },
              { icon: HandPlatter, title: "Real home food", text: "Small batches, less oil, made the way families eat." },
              { icon: Truck, title: "Local delivery", text: "Kitchens deliver only to nearby service areas." },
              { icon: Wallet, title: "Fair prices", text: "Pay cash on delivery. Free delivery above ₹299." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <item.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{item.title}</p>
                  <p className="text-sm text-stone-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a home cook */}
      <section className="container-page py-14">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-white sm:px-12 sm:py-14">
          <div className="pointer-events-none absolute -right-10 -top-10 text-[180px] opacity-15" aria-hidden>
            👩‍🍳
          </div>
          <div className="relative max-w-xl">
            <h2 className="text-3xl font-bold sm:text-4xl">Love cooking? Become a Home Cook.</h2>
            <p className="mt-3 text-orange-100">
              Turn your kitchen into a small business. Create your kitchen profile, publish your menu and tiffin plans,
              and start receiving orders from people nearby.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/register?role=PROVIDER" className="btn bg-white text-brand-700 hover:bg-orange-50">
                Start selling <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/how-it-works#cooks" className="btn border border-white/40 text-white hover:bg-white/10">
                Learn more
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
