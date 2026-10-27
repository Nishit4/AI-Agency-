"use client";

import { Star } from "lucide-react";
import { useActionState, useState } from "react";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { createReview } from "@/lib/actions/review";
import { cn } from "@/lib/utils";
import type { ActionState } from "@/types";

const LABELS = ["", "Poor", "Okay", "Good", "Very good", "Excellent"];

export function ReviewForm({ orderId }: { orderId: string }) {
  const [state, formAction] = useActionState<ActionState, FormData>(createReview, {});
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  if (state.ok) return <FormMessage state={state} />;

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="rating" value={rating || ""} />
      <div>
        <p className="label">Your rating</p>
        <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              aria-pressed={rating === n}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "h-8 w-8 transition",
                  n <= (hover || rating) ? "fill-amber-400 text-amber-400" : "text-stone-300",
                )}
              />
            </button>
          ))}
          <span className="ml-2 text-sm font-medium text-stone-600">{LABELS[hover || rating]}</span>
        </div>
        {state.errors?.rating && <p className="field-error">{state.errors.rating[0]}</p>}
      </div>
      <div>
        <label htmlFor="comment" className="label">Comment (optional)</label>
        <textarea
          id="comment"
          name="comment"
          maxLength={500}
          defaultValue={state.values?.comment}
          className="input min-h-[90px]"
          placeholder="How was the food? Taste, portion, packaging…"
        />
      </div>
      <SubmitButton pendingText="Posting…">Post review</SubmitButton>
    </form>
  );
}
