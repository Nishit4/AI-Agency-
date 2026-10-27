import { Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="mt-16 bg-ink text-orange-50">
      <div className="container-page grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Logo light />
          <p className="text-sm text-orange-100/80">
            Connecting local home cooks and tiffin providers with people who miss fresh, homemade food.
          </p>
        </div>
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-orange-200">Explore</h3>
          <ul className="space-y-2 text-sm text-orange-100/80">
            <li><Link href="/kitchens" className="hover:text-white">Browse kitchens</Link></li>
            <li><Link href="/how-it-works" className="hover:text-white">How it works</Link></li>
            <li><Link href="/about" className="hover:text-white">About us</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-orange-200">For home cooks</h3>
          <ul className="space-y-2 text-sm text-orange-100/80">
            <li><Link href="/register?role=PROVIDER" className="hover:text-white">Become a Home Cook</Link></li>
            <li><Link href="/provider/dashboard" className="hover:text-white">Provider dashboard</Link></li>
            <li><Link href="/how-it-works#cooks" className="hover:text-white">Selling guide</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-orange-200">Contact</h3>
          <ul className="space-y-2 text-sm text-orange-100/80">
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Ahmedabad, Gujarat</li>
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> hello@momskitchen.com</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +91 98765 00000</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-orange-100/60 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} Mom&apos;s Kitchen · Home Food &amp; Tiffin Marketplace</p>
          <p>Next.js full-stack college project</p>
        </div>
      </div>
    </footer>
  );
}
