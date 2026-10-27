import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "How it works" };

const CUSTOMER_STEPS = [
  ["Open website", "Visit Mom's Kitchen on your phone, tablet or laptop."],
  ["Find a kitchen", "Search by dish or cuisine, or filter by your city and pincode."],
  ["View the menu", "See dishes, tiffin plans, prices, veg labels and reviews."],
  ["Add to cart", "Add dishes or a tiffin plan from one kitchen to your cart."],
  ["Checkout", "Choose a saved address, add cooking notes and pay cash on delivery."],
  ["Track your order", "Follow every step: accepted, preparing, ready, out for delivery, delivered."],
  ["Review", "After delivery, rate the kitchen to help others discover great food."],
];

const COOK_STEPS = [
  ["Register", "Sign up as a Home Cook in under a minute."],
  ["Create your kitchen", "Add your kitchen name, story, address, service areas and timings."],
  ["Get approved", "Our admin team reviews your kitchen before it goes live."],
  ["Add your menu", "Publish dishes and daily, weekly or monthly tiffin plans."],
  ["Set availability", "Open or close your kitchen and mark dishes sold out anytime."],
  ["Receive orders", "Accept or reject new orders and update their status as you cook."],
  ["Grow", "Track earnings and read reviews from your dashboard."],
];

const STATUSES = [
  ["PENDING", "Order created and waiting for the kitchen"],
  ["ACCEPTED", "The kitchen accepted the order"],
  ["PREPARING", "Food is being prepared"],
  ["READY", "Food is ready for pickup / delivery"],
  ["OUT_FOR_DELIVERY", "Order has left the kitchen"],
  ["DELIVERED", "Customer received the order"],
  ["REJECTED", "The kitchen declined the order"],
  ["CANCELLED", "Order was cancelled (customers can cancel while it is pending)"],
];

function Steps({ steps }: { steps: string[][] }) {
  return (
    <ol className="space-y-4">
      {steps.map(([title, text], index) => (
        <li key={title} className="flex gap-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {index + 1}
          </span>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-sm text-stone-600">{text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="container-page py-12">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">How Mom&apos;s Kitchen works</h1>
        <p className="mt-4 text-lg text-stone-600">
          Three roles, one simple marketplace: customers order, home cooks cook, and admins keep it all running smoothly.
        </p>
      </div>

      <div className="mx-auto mt-12 grid grid-cols-1 max-w-5xl gap-6 lg:grid-cols-2">
        <section className="card p-6 sm:p-8">
          <p className="text-3xl" aria-hidden>🙋</p>
          <h2 className="mt-2 text-2xl font-bold">For customers</h2>
          <div className="mt-6"><Steps steps={CUSTOMER_STEPS} /></div>
          <Link href="/kitchens" className="btn-primary mt-8">Find food near me</Link>
        </section>
        <section id="cooks" className="card scroll-mt-24 p-6 sm:p-8">
          <p className="text-3xl" aria-hidden>👩‍🍳</p>
          <h2 className="mt-2 text-2xl font-bold">For home cooks</h2>
          <div className="mt-6"><Steps steps={COOK_STEPS} /></div>
          <Link href="/register?role=PROVIDER" className="btn-primary mt-8">Become a Home Cook</Link>
        </section>
      </div>

      <section className="mx-auto mt-12 max-w-5xl">
        <h2 className="section-title">Order status explained</h2>
        <div className="card mt-6 overflow-hidden">
          <dl className="divide-y divide-orange-50">
            {STATUSES.map(([status, meaning]) => (
              <div key={status} className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-center sm:gap-6">
                <dt className="w-48 shrink-0 font-mono text-xs font-semibold text-brand-800">{status}</dt>
                <dd className="text-sm text-stone-600">{meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto mt-12 max-w-5xl">
        <h2 className="section-title">For admins</h2>
        <p className="mt-2 text-stone-600">
          The admin dashboard is used to approve new home cooks, manage users, categories and listings, monitor all
          orders and moderate reviews — keeping the marketplace trustworthy for everyone.
        </p>
      </section>
    </div>
  );
}
