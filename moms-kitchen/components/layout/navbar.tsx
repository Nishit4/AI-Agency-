import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { getCartCount } from "@/lib/data/cart";
import { roleHome } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { UserMenu } from "./user-menu";

export const NAV_LINKS = [
  { href: "/kitchens", label: "Kitchens" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About" },
];

export async function Navbar() {
  const user = await getCurrentUser();
  const cartCount = user?.role === "CUSTOMER" ? await getCartCount(user.id) : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-orange-100 bg-cream/90 backdrop-blur supports-[backdrop-filter]:bg-cream/75">
      <nav className="container-page flex h-16 items-center justify-between gap-4">
        <Logo />

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="btn-ghost">
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link href="/register?role=PROVIDER" className="btn-ghost text-brand-700">
              Become a Home Cook
            </Link>
          )}
        </div>

        <div className="flex items-center gap-2">
          {(!user || user.role === "CUSTOMER") && (
            <Link
              href="/customer/cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl text-ink hover:bg-brand-50"
              aria-label={`Cart, ${cartCount} items`}
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}

          {user ? (
            <UserMenu user={user} dashboardHref={roleHome(user.role)} />
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link href="/login" className="btn-ghost">
                Log in
              </Link>
              <Link href="/register" className="btn-primary">
                Sign up
              </Link>
            </div>
          )}

          <MobileMenu
            links={NAV_LINKS}
            loggedIn={Boolean(user)}
            dashboardHref={user ? roleHome(user.role) : null}
          />
        </div>
      </nav>
    </header>
  );
}
