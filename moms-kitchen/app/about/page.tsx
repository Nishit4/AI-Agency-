import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "About" };

const VALUES = [
  { emoji: "🏡", title: "Local first", text: "We help neighbourhood home cooks reach customers who live nearby." },
  { emoji: "🤝", title: "Trust", text: "Kitchens are approved by our team and rated by real customers after delivery." },
  { emoji: "🌿", title: "Fresh & honest", text: "Clear veg / non-veg labels, honest prices and food cooked the same day." },
  { emoji: "💪", title: "Empowering cooks", text: "Many of our cooks are homemakers starting their first small business." },
];

export default function AboutPage() {
  return (
    <div className="container-page py-12">
      <section className="mx-auto max-w-3xl text-center">
        <span className="text-5xl" aria-hidden>👩‍🍳</span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">About Mom&apos;s Kitchen</h1>
        <p className="mt-5 text-lg text-stone-600">
          Mom&apos;s Kitchen is a web-based marketplace for homemade food. It lets people who cook from home or run
          small tiffin services create a kitchen profile, publish menus and tiffin plans, manage availability and
          receive orders — while customers discover home kitchens, order food and track it to their door.
        </p>
      </section>

      <section className="mx-auto mt-12 grid grid-cols-1 max-w-5xl gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-xl font-bold">The problem</h2>
          <p className="mt-2 text-stone-600">
            Food-ordering apps are built around restaurants. Many home cooks and small tiffin providers have no
            dedicated place where nearby customers can find their food and place structured orders — and many
            customers would rather eat fresh homemade meals than restaurant food every day.
          </p>
        </div>
        <div className="card p-6">
          <h2 className="text-xl font-bold">Our solution</h2>
          <p className="mt-2 text-stone-600">
            A simple digital platform for discovery, ordering and management: customers browse by cuisine and
            service area, home cooks manage their menu, tiffins and orders, and an admin keeps the marketplace safe
            by approving providers and moderating listings and reviews.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl">
        <h2 className="section-title text-center">What we care about</h2>
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {VALUES.map((value) => (
            <div key={value.title} className="card p-5 text-center">
              <span className="text-4xl" aria-hidden>{value.emoji}</span>
              <h3 className="mt-3 font-bold">{value.title}</h3>
              <p className="mt-1 text-sm text-stone-600">{value.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-3xl rounded-3xl bg-brand-50 p-8 text-center">
        <h2 className="text-2xl font-bold">Hungry for something homemade?</h2>
        <p className="mt-2 text-stone-600">Discover kitchens near you or start selling your own food.</p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link href="/kitchens" className="btn-primary">Browse kitchens</Link>
          <Link href="/register?role=PROVIDER" className="btn-secondary">Become a Home Cook</Link>
        </div>
      </section>
    </div>
  );
}
