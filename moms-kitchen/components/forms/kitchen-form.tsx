"use client";

import { useActionState } from "react";
import { CheckboxField, Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveKitchen } from "@/lib/actions/provider";
import type { ActionState, KitchenDTO } from "@/types";

export function KitchenForm({ kitchen }: { kitchen: KitchenDTO | null }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveKitchen, {});
  const v = state.values ?? {};
  const value = (key: string, fallback?: string) => v[key] ?? fallback ?? "";

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <Field label="Kitchen name" name="kitchenName" placeholder="e.g. Mom's Gujarati Kitchen" defaultValue={value("kitchenName", kitchen?.kitchenName)} errors={state.errors?.kitchenName} />
      <Field
        as="textarea"
        label="About your kitchen"
        name="description"
        placeholder="What do you cook? What makes your food special?"
        defaultValue={value("description", kitchen?.description)}
        errors={state.errors?.description}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Contact number" name="phone" type="tel" inputMode="numeric" defaultValue={value("phone", kitchen?.phone)} errors={state.errors?.phone} />
        <Field label="Opening hours" name="openingHours" placeholder="8:00 AM – 9:00 PM" defaultValue={value("openingHours", kitchen?.openingHours)} errors={state.errors?.openingHours} />
      </div>

      <fieldset className="space-y-4 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
        <legend className="px-1 text-sm font-semibold">Kitchen address</legend>
        <Field label="Address line" name="line" placeholder="House no., society, street" defaultValue={value("line", kitchen?.address.line)} errors={state.errors?.line} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Area / locality" name="area" placeholder="Navrangpura" defaultValue={value("area", kitchen?.address.area)} errors={state.errors?.area} />
          <Field label="City" name="city" placeholder="Ahmedabad" defaultValue={value("city", kitchen?.address.city)} errors={state.errors?.city} />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="State" name="state" placeholder="Gujarat" defaultValue={value("state", kitchen?.address.state)} errors={state.errors?.state} />
          <Field label="Pincode" name="pincode" inputMode="numeric" placeholder="380009" defaultValue={value("pincode", kitchen?.address.pincode)} errors={state.errors?.pincode} />
        </div>
      </fieldset>

      <Field
        label="Service areas"
        name="serviceAreas"
        placeholder="380009, 380006, Navrangpura, Naranpura"
        hint="Comma-separated pincodes or area names you deliver to"
        defaultValue={value("serviceAreas", kitchen?.serviceAreas.join(", "))}
        errors={state.errors?.serviceAreas}
      />
      <Field
        label="Cover image URL (optional)"
        name="image"
        type="url"
        placeholder="https://…"
        hint="Paste a link to a photo of your kitchen or food"
        defaultValue={value("image", kitchen?.image)}
        errors={state.errors?.image}
      />
      <CheckboxField
        label="Pure vegetarian kitchen"
        name="isPureVeg"
        defaultChecked={state.values ? state.values.isPureVeg === "on" : kitchen?.isPureVeg ?? true}
        description="Show a 🌱 Pure veg badge on your kitchen"
      />
      <SubmitButton pendingText="Saving…">{kitchen ? "Save changes" : "Create kitchen"}</SubmitButton>
    </form>
  );
}
