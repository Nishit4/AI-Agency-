"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { logoutAction } from "@/lib/actions/auth";

export function MobileMenu({
  links,
  loggedIn,
  dashboardHref,
}: {
  links: { href: string; label: string }[];
  loggedIn: boolean;
  dashboardHref: string | null;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close the menu after navigating
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-brand-50"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-16 border-b border-orange-100 bg-cream shadow-lg">
          <div className="container-page flex flex-col gap-1 py-3">
            {links.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-xl px-3 py-3 font-medium hover:bg-brand-50">
                {link.label}
              </Link>
            ))}
            {loggedIn && dashboardHref ? (
              <>
                <Link href={dashboardHref} className="rounded-xl px-3 py-3 font-medium hover:bg-brand-50">
                  My dashboard
                </Link>
                <Link href="/profile" className="rounded-xl px-3 py-3 font-medium hover:bg-brand-50">
                  Profile
                </Link>
                <form action={logoutAction}>
                  <button type="submit" className="w-full rounded-xl px-3 py-3 text-left font-medium text-red-600 hover:bg-red-50">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/register?role=PROVIDER" className="rounded-xl px-3 py-3 font-medium text-brand-700 hover:bg-brand-50">
                  Become a Home Cook
                </Link>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <Link href="/login" className="btn-secondary">
                    Log in
                  </Link>
                  <Link href="/register" className="btn-primary">
                    Sign up
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
