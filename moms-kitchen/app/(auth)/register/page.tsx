import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/forms/register-form";
import { roleHome } from "@/lib/roles";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect(roleHome(user.role));
  const { role } = await searchParams;

  return (
    <div className="card w-full max-w-xl p-6 sm:p-8">
      <div className="mb-6 text-center">
        <span className="text-4xl" aria-hidden>🥘</span>
        <h1 className="mt-2 text-2xl font-bold">Create your account</h1>
        <p className="mt-1 text-sm text-stone-600">Join Mom&apos;s Kitchen as a customer or a home cook</p>
      </div>
      <RegisterForm defaultRole={role === "PROVIDER" ? "PROVIDER" : "CUSTOMER"} />
    </div>
  );
}
