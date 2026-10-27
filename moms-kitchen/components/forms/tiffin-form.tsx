"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckboxField, Field, SelectField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveTiffin } from "@/lib/actions/provider";
import { TIFFIN_FREQUENCY_LABEL } from "@/lib/constants";
import { TIFFIN_FREQUENCIES, type ActionState, type TiffinPlanDTO } from "@/types";

export function TiffinForm({ plan }: { plan: TiffinPlanDTO | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveTiffin.bind(null, plan?.id ?? null), {});
  const v = state.values ?? {};
  const value = (key: string, fallback?: string | number) => v[key] ?? (fallback !== undefined ? String(fallback) : "");

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Plan name" name="name" placeholder="e.g. Monthly Gujarati Tiffin" defaultValue={value("name", plan?.name)} errors={state.errors?.name} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <SelectField label="Frequency" name="frequency" defaultValue={value("frequency", plan?.frequency ?? "DAILY")} errors={state.errors?.frequency}>
          {TIFFIN_FREQUENCIES.map((frequency) => (
            <option key={frequency} value={frequency}>
              {TIFFIN_FREQUENCY_LABEL[frequency]}
            </option>
          ))}
        </SelectField>
        <Field label="Price (₹)" name="price" type="number" min={1} step={1} inputMode="numeric" defaultValue={value("price", plan?.price)} errors={state.errors?.price} />
      </div>
      <Field
        label="Meals included"
        name="meals"
        placeholder="e.g. 26 lunches: 4 roti, dal, sabzi, rice, salad"
        defaultValue={value("meals", plan?.meals)}
        errors={state.errors?.meals}
      />
      <Field
        as="textarea"
        label="Description"
        name="description"
        placeholder="Who is this plan for? Delivery timings?"
        defaultValue={value("description", plan?.description)}
        errors={state.errors?.description}
      />
      <CheckboxField
        label="Available"
        name="isAvailable"
        defaultChecked={state.values ? state.values.isAvailable === "on" : plan?.isAvailable ?? true}
        description="Customers can add this plan to their cart"
      />
      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingText="Saving…">{plan ? "Save plan" : "Add plan"}</SubmitButton>
        <Link href="/provider/tiffin" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
