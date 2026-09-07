"use client";

import { useEffect, useRef } from "react";

const EMBED_SCRIPT_SRC = "https://app.cal.com/embed/embed.js";
const CONTAINER_ID = "smartops-cal-inline";

declare global {
  interface Window {
    Cal?: ((...args: unknown[]) => void) & { loaded?: boolean; ns?: Record<string, unknown>; q?: unknown[] };
  }
}

/**
 * Inline Cal.com booking widget. Renders the CEO's scheduling page so
 * qualified leads can book an intro call without leaving the dashboard.
 * Set NEXT_PUBLIC_CALCOM_LINK to your Cal.com link (e.g. "nishit/intro-call").
 */
export function CalEmbed({ calLink }: { calLink?: string }) {
  const initialized = useRef(false);

  useEffect(() => {
    if (!calLink || initialized.current) return;
    initialized.current = true;

    // Cal.com's loader stub: queues API calls until embed.js finishes loading.
    if (!window.Cal) {
      const cal = ((...args: unknown[]) => {
        cal.q = cal.q || [];
        cal.q.push(args);
      }) as NonNullable<Window["Cal"]>;
      cal.q = [];
      window.Cal = cal;

      const script = document.createElement("script");
      script.src = EMBED_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    window.Cal?.("init", { origin: "https://cal.com" });
    window.Cal?.("inline", {
      elementOrSelector: `#${CONTAINER_ID}`,
      calLink,
      layout: "month_view",
    });
  }, [calLink]);

  if (!calLink) {
    return (
      <p className="py-8 text-center text-sm text-slate-400">
        Set <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">NEXT_PUBLIC_CALCOM_LINK</code> to embed your
        booking calendar.
      </p>
    );
  }

  return <div id={CONTAINER_ID} className="min-h-[520px] w-full overflow-hidden rounded-lg" />;
}
