"use client";

import { useActionState, useEffect, useRef } from "react";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { createAddress } from "@/lib/actions/address";
import type { ActionState } from "@/types";

export function AddressForm({ onSaved }: { onSaved?: () => void }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createAddress, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      onSaved?.();
    }
  }, [state, onSaved]);

  const v = state.ok ? {} : (state.values ?? {});
  return (
    <form ref={formRef} action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Label" name="label" placeholder="Home, Work…" defaultValue={v.label ?? "Home"} errors={state.errors?.label} />
        <Field label="Pincode" name="pincode" inputMode="numeric" placeholder="380009" defaultValue={v.pincode} errors={state.errors?.pincode} />
      </div>
      <Field
        label="Address"
        name="addressLine"
        placeholder="Flat / house no., building, street"
        defaultValue={v.addressLine}
        errors={state.errors?.addressLine}
      />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="City" name="city" placeholder="Ahmedabad" defaultValue={v.city} errors={state.errors?.city} />
        <Field label="State" name="state" placeholder="Gujarat" defaultValue={v.state} errors={state.errors?.state} />
        <Field label="Landmark (optional)" name="landmark" defaultValue={v.landmark} errors={state.errors?.landmark} />
      </div>
      <SubmitButton pendingText="Saving…">Save address</SubmitButton>
    </form>
  );
}
