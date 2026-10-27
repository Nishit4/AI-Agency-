"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CheckboxField, Field, SelectField } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveFood } from "@/lib/actions/provider";
import type { ActionState, CategoryDTO, FoodDTO } from "@/types";

export function FoodForm({ food, categories }: { food: FoodDTO | null; categories: CategoryDTO[] }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveFood.bind(null, food?.id ?? null), {});
  const v = state.values ?? {};
  const value = (key: string, fallback?: string | number) => v[key] ?? (fallback !== undefined ? String(fallback) : "");

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_160px]">
        <Field label="Dish name" name="name" placeholder="e.g. Gujarati Lunch Tiffin" defaultValue={value("name", food?.name)} errors={state.errors?.name} />
        <Field label="Price (₹)" name="price" type="number" min={1} step={1} inputMode="numeric" defaultValue={value("price", food?.price)} errors={state.errors?.price} />
      </div>
      <SelectField label="Category" name="categoryId" defaultValue={value("categoryId", food?.categoryId)} errors={state.errors?.categoryId}>
        <option value="">Choose a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.emoji} {category.name}
          </option>
        ))}
      </SelectField>
      <Field
        as="textarea"
        label="Description"
        name="description"
        placeholder="What's included? Portion size? Spice level?"
        defaultValue={value("description", food?.description)}
        errors={state.errors?.description}
      />
      <Field
        label="Photo URL (optional)"
        name="image"
        type="url"
        placeholder="https://…"
        hint="Without a photo, a colourful category illustration is shown"
        defaultValue={value("image", food?.image)}
        errors={state.errors?.image}
      />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CheckboxField
          label="Vegetarian"
          name="isVeg"
          defaultChecked={state.values ? state.values.isVeg === "on" : food?.isVeg ?? true}
          description="Shows the green veg mark"
        />
        <CheckboxField
          label="Available to order"
          name="isAvailable"
          defaultChecked={state.values ? state.values.isAvailable === "on" : food?.isAvailable ?? true}
          description="Untick to mark as sold out"
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <SubmitButton pendingText="Saving…">{food ? "Save dish" : "Add dish"}</SubmitButton>
        <Link href="/provider/menu" className="btn-secondary">Cancel</Link>
      </div>
    </form>
  );
}
