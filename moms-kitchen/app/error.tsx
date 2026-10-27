"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isDbError = /mongo|ECONNREFUSED|server selection|MONGODB_URI/i.test(error.message ?? "");

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="text-6xl" aria-hidden>🥘</span>
      <h1 className="mt-4 text-3xl font-bold">Something went wrong</h1>
      {isDbError ? (
        <div className="mt-3 max-w-lg space-y-2 text-sm text-stone-600">
          <p>We couldn&apos;t connect to the database.</p>
          <p>
            Make sure MongoDB is running — start it with <code className="rounded bg-orange-100 px-1.5 py-0.5">npm run db</code> in a
            second terminal, or set <code className="rounded bg-orange-100 px-1.5 py-0.5">MONGODB_URI</code> in{" "}
            <code className="rounded bg-orange-100 px-1.5 py-0.5">.env.local</code>. See README.md for help.
          </p>
        </div>
      ) : (
        <p className="mt-2 max-w-md text-stone-600">Please try again. If the problem continues, come back in a little while.</p>
      )}
      <div className="mt-6 flex gap-3">
        <button type="button" onClick={reset} className="btn-primary">Try again</button>
        <Link href="/" className="btn-secondary">Go home</Link>
      </div>
    </div>
  );
}
