"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { saveCategory } from "@/lib/actions/admin";
import type { ActionState, CategoryDTO } from "@/types";

export function CategoryForm({ category, onDone }: { category?: CategoryDTO; onDone?: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(saveCategory.bind(null, category?.id ?? null), {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      if (!category) formRef.current?.reset();
      onDone?.();
    }
  }, [state, category, onDone]);

  const v = state.ok ? {} : (state.values ?? {});
  return (
    <form ref={formRef} action={formAction} className="space-y-3" noValidate>
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[90px_minmax(0,1fr)]">
        <Field label="Emoji" name="emoji" defaultValue={v.emoji ?? category?.emoji ?? "🍲"} errors={state.errors?.emoji} />
        <Field label="Name" name="name" defaultValue={v.name ?? category?.name} errors={state.errors?.name} />
      </div>
      <Field label="Description" name="description" defaultValue={v.description ?? category?.description} errors={state.errors?.description} />
      <SubmitButton className="btn-primary btn-sm" pendingText="Saving…">{category ? "Save" : "Add category"}</SubmitButton>
    </form>
  );
}
