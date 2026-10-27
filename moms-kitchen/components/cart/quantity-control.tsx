"use client";

import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/ui/toaster";
import { updateCartQuantity } from "@/lib/actions/cart";
import { MAX_ITEM_QUANTITY } from "@/lib/constants";
import type { ItemType } from "@/types";

export function QuantityControl({
  itemType,
  itemId,
  quantity,
}: {
  itemType: ItemType;
  itemId: string;
  quantity: number;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const toast = useToast();

  function change(next: number) {
    startTransition(async () => {
      const result = await updateCartQuantity({ itemType, itemId, quantity: next });
      if (!result.ok) toast(result.message, "error");
      else if (next === 0) toast(result.message, "success");
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-xl border border-orange-200 bg-white">
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-stone-600 hover:text-brand-700 disabled:opacity-40"
          onClick={() => change(quantity - 1)}
          disabled={pending}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="flex w-8 justify-center text-sm font-semibold">
          {pending ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : quantity}
        </span>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center text-stone-600 hover:text-brand-700 disabled:opacity-40"
          onClick={() => change(quantity + 1)}
          disabled={pending || quantity >= MAX_ITEM_QUANTITY}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <button
        type="button"
        onClick={() => change(0)}
        disabled={pending}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-stone-400 hover:bg-red-50 hover:text-red-600"
        aria-label="Remove item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
