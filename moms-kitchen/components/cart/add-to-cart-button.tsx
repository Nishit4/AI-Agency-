"use client";

import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useToast } from "@/components/ui/toaster";
import { addToCart } from "@/lib/actions/cart";
import { MAX_ITEM_QUANTITY } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { ItemType } from "@/types";

export function AddToCartButton({
  itemType,
  itemId,
  disabled = false,
  disabledLabel = "Unavailable",
  withQuantity = false,
  size = "md",
  className,
}: {
  itemType: ItemType;
  itemId: string;
  disabled?: boolean;
  disabledLabel?: string;
  withQuantity?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  function add() {
    startTransition(async () => {
      let result = await addToCart({ itemType, itemId, quantity });
      if (result.requiresLogin) {
        toast(result.message, "info");
        router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
        return;
      }
      if (result.needsReplace) {
        if (!window.confirm(result.message)) return;
        result = await addToCart({ itemType, itemId, quantity, replace: true });
      }
      toast(result.message, result.ok ? "success" : "error");
      if (result.ok) {
        setQuantity(1);
        router.refresh();
      }
    });
  }

  if (disabled) {
    return (
      <button type="button" disabled className={cn("btn-secondary", size === "sm" && "btn-sm", className)}>
        {disabledLabel}
      </button>
    );
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {withQuantity && (
        <div className="flex items-center rounded-xl border border-orange-200 bg-white">
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-stone-600 hover:text-brand-700 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center text-sm font-semibold" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center text-stone-600 hover:text-brand-700 disabled:opacity-40"
            onClick={() => setQuantity((q) => Math.min(MAX_ITEM_QUANTITY, q + 1))}
            disabled={quantity >= MAX_ITEM_QUANTITY}
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={add}
        disabled={pending}
        className={cn("btn-primary", size === "sm" && "btn-sm", withQuantity && "flex-1")}
      >
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingCart className="h-4 w-4" />}
        Add{size === "md" ? " to cart" : ""}
      </button>
    </div>
  );
}
