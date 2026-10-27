import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/forms/login-form";
import { roleHome } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user.role));
  const { callbackUrl } = await searchParams;

  // Auth.js may pass an absolute URL; keep only the path part
  let safeCallback: string | undefined;
  if (callbackUrl) {
    try {
      const url = new URL(callbackUrl, "http://localhost");
      safeCallback = url.pathname.startsWith("/") && !url.pathname.startsWith("//") ? url.pathname + url.search : undefined;
    } catch {
      safeCallback = undefined;
    }
  }

  return (
    <div className="card w-full max-w-md p-6 sm:p-8">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>🍛</span>
        <h1 className="mt-2 text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-stone-600">Log in to order, cook or manage Mom&apos;s Kitchen</p>
      </div>
      <LoginForm callbackUrl={safeCallback} />
    </div>
  );
}
