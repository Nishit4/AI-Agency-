"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { loginAction } from "@/lib/actions/auth";
import type { ActionState } from "@/types";

const DEMO = [
  { label: "Customer", email: "customer@momskitchen.com", password: "customer123" },
  { label: "Home Cook", email: "meena@momskitchen.com", password: "provider123" },
  { label: "Admin", email: "admin@momskitchen.com", password: "admin123" },
];

export function LoginForm({ callbackUrl }: { callbackUrl?: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(loginAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  function fillDemo(email: string, password: string) {
    const form = formRef.current;
    if (!form) return;
    (form.elements.namedItem("email") as HTMLInputElement).value = email;
    (form.elements.namedItem("password") as HTMLInputElement).value = password;
  }

  return (
    <>
      <form ref={formRef} action={formAction} className="space-y-4" noValidate>
        <FormMessage state={state} />
        <input type="hidden" name="callbackUrl" value={callbackUrl ?? ""} />
        <Field
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          required
          defaultValue={state.values?.email}
          errors={state.errors?.email}
        />
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          errors={state.errors?.password}
        />
        <SubmitButton className="btn-primary w-full" pendingText="Logging in…">
          Log in
        </SubmitButton>
        <p className="text-center text-sm text-stone-600">
          New to Mom&apos;s Kitchen?{" "}
          <Link href="/register" className="font-semibold text-brand-700 hover:underline">
            Create an account
          </Link>
        </p>
      </form>

      <div className="mt-6 rounded-xl border border-dashed border-orange-300 bg-orange-50/60 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-800">Demo accounts</p>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
          {DEMO.map((account) => (
            <button
              key={account.label}
              type="button"
              onClick={() => fillDemo(account.email, account.password)}
              className="rounded-lg border border-orange-200 bg-white px-3 py-2 text-left text-xs hover:border-brand-400"
            >
              <span className="block font-semibold text-ink">{account.label}</span>
              <span className="block truncate text-stone-500">{account.email}</span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-stone-500">Tap one to fill the form, then press Log in.</p>
      </div>
    </>
  );
}
