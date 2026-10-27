"use client";

import { Banknote, MapPin } from "lucide-react";
import { useActionState, useEffect, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { placeOrder } from "@/lib/actions/order";
import { cn, formatPrice } from "@/lib/utils";
import type { ActionState, AddressDTO } from "@/types";

export function CheckoutForm({ addresses, totalAmount }: { addresses: AddressDTO[]; totalAmount: number }) {
  const [state, formAction] = useActionState<ActionState, FormData>(placeOrder, {});
  const [selected, setSelected] = useState(addresses[0]?.id ?? "");

  // Select the first address when one is added or the selected one is deleted
  useEffect(() => {
    if (!addresses.some((address) => address.id === selected)) setSelected(addresses[0]?.id ?? "");
  }, [addresses, selected]);

  return (
    <form action={formAction} className="space-y-6">
      <FormMessage state={state} />

      <section className="card p-5">
        <h2 className="text-lg font-bold">1. Delivery address</h2>
        {addresses.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">Add an address below to continue.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {addresses.map((address) => (
              <label
                key={address.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 text-sm transition",
                  selected === address.id ? "border-brand-500 bg-brand-50" : "border-orange-100 bg-white hover:border-orange-200",
                )}
              >
                <input
                  type="radio"
                  name="addressId"
                  value={address.id}
                  checked={selected === address.id}
                  onChange={() => setSelected(address.id)}
                  className="mt-1 h-4 w-4 text-brand-600"
                />
                <span>
                  <span className="flex items-center gap-1 font-semibold">
                    <MapPin className="h-4 w-4 text-brand-600" /> {address.label}
                  </span>
                  <span className="mt-1 block text-stone-600">{address.addressLine}</span>
                  <span className="block text-stone-600">
                    {address.city} – {address.pincode}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        {state.errors?.addressId && <p className="field-error">{state.errors.addressId[0]}</p>}
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold">2. Cooking notes (optional)</h2>
        <label htmlFor="notes" className="sr-only">Notes for the kitchen</label>
        <textarea
          id="notes"
          name="notes"
          maxLength={300}
          defaultValue={state.values?.notes}
          placeholder="e.g. Less spicy please, no onion-garlic, ring the bell twice…"
          className="input mt-3 min-h-[90px]"
        />
      </section>

      <section className="card p-5">
        <h2 className="text-lg font-bold">3. Payment</h2>
        <label className="mt-3 flex items-center gap-3 rounded-xl border-2 border-brand-500 bg-brand-50 p-4 text-sm">
          <input type="radio" name="paymentMethod" value="COD" defaultChecked className="h-4 w-4 text-brand-600" />
          <Banknote className="h-5 w-5 text-brand-700" />
          <span>
            <span className="block font-semibold">Cash / UPI on delivery</span>
            <span className="block text-xs text-stone-500">Pay the home cook when your food arrives</span>
          </span>
        </label>
        <p className="mt-2 text-xs text-stone-500">Online payments (Razorpay) are planned for a future version.</p>
      </section>

      <SubmitButton className="btn-primary w-full py-3 text-base" pendingText="Placing order…">
        Place order · {formatPrice(totalAmount)}
      </SubmitButton>
    </form>
  );
}
