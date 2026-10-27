"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { registerAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/types";

const ROLES = [
  { value: "CUSTOMER", emoji: "🙋", title: "I want to order food", text: "Discover kitchens and order meals" },
  { value: "PROVIDER", emoji: "👩‍🍳", title: "I want to sell food", text: "Create a kitchen and get orders" },
] as const;

export function RegisterForm({ defaultRole }: { defaultRole: "CUSTOMER" | "PROVIDER" }) {
  const [state, formAction] = useActionState<ActionState, FormData>(registerAction, {});
  const [role, setRole] = useState<string>(defaultRole);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />

      <fieldset>
        <legend className="label">Account type</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ROLES.map((option) => (
            <label
              key={option.value}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border-2 bg-white p-3 transition",
                role === option.value ? "border-brand-500 bg-brand-50" : "border-orange-100 hover:border-orange-200",
              )}
            >
              <input
                type="radio"
                name="role"
                value={option.value}
                checked={role === option.value}
                onChange={() => setRole(option.value)}
                className="sr-only"
              />
              <span className="text-2xl" aria-hidden>{option.emoji}</span>
              <span>
                <span className="block text-sm font-semibold">{option.title}</span>
                <span className="block text-xs text-stone-500">{option.text}</span>
              </span>
            </label>
          ))}
        </div>
        {state.errors?.role && <p className="field-error">{state.errors.role[0]}</p>}
      </fieldset>

      <Field label="Full name" name="name" autoComplete="name" required defaultValue={state.values?.name} errors={state.errors?.name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" autoComplete="email" required defaultValue={state.values?.email} errors={state.errors?.email} />
        <Field
          label="Mobile number"
          name="phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="10-digit number"
          required
          defaultValue={state.values?.phone}
          errors={state.errors?.phone}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field
          label="Password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          hint="At least 6 characters"
          errors={state.errors?.password}
        />
        <Field
          label="Confirm password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          errors={state.errors?.confirmPassword}
        />
      </div>

      <SubmitButton className="btn-primary w-full" pendingText="Creating account…">
        Create account
      </SubmitButton>
      <p className="text-center text-sm text-stone-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-700 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
