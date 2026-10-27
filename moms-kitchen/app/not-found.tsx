import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl" aria-hidden>🍽️</span>
      <h1 className="mt-4 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 max-w-md text-stone-600">
        This dish isn&apos;t on the menu. The page may have moved, or the kitchen may not be available.
      </p>
      <div className="mt-6 flex gap-3">
        <Link href="/" className="btn-secondary">Go home</Link>
        <Link href="/kitchens" className="btn-primary">Browse kitchens</Link>
      </div>
    </div>
  );
}
