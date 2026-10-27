import type { ZodError } from "zod";
import type { ActionState } from "@/types";

/**
 * Validation failure. The submitted values (minus passwords) are sent back so
 * forms can keep what the user typed — React resets forms after an action.
 */
export function fieldErrors(error: ZodError, formData?: FormData): ActionState {
  return keepValues(
    {
      ok: false,
      message: "Please fix the highlighted fields.",
      errors: error.flatten().fieldErrors as Record<string, string[]>,
    },
    formData,
  );
}

export function keepValues(state: ActionState, formData?: FormData): ActionState {
  const values: Record<string, string> = {};
  formData?.forEach((value, key) => {
    if (typeof value === "string" && !/password/i.test(key)) values[key] = value;
  });
  return { ...state, values };
}

export function failure(message: string): ActionState {
  return { ok: false, message };
}

export function success(message: string): ActionState {
  return { ok: true, message };
}

/** Only allow redirects to paths inside this site. */
export function safeCallbackUrl(value: FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") return null;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
  return value;
}
