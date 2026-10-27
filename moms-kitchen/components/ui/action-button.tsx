"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useToast } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/types";

/**
 * A button that runs a server action (already bound to its arguments),
 * optionally asks for confirmation, and shows the result as a toast.
 */
export function ActionButton({
  action,
  children,
  className = "btn-secondary btn-sm",
  confirmMessage,
  title,
}: {
  action: () => Promise<ActionState>;
  children: React.ReactNode;
  className?: string;
  confirmMessage?: string;
  title?: string;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      title={title}
      disabled={pending}
      className={cn(className)}
      onClick={() => {
        if (confirmMessage && !window.confirm(confirmMessage)) return;
        startTransition(async () => {
          const result = await action();
          if (result?.message) toast(result.message, result.ok ? "success" : "error");
          router.refresh();
        });
      }}
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
