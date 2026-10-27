"use client";

import { useActionState } from "react";
import { Field } from "@/components/ui/field";
import { FormMessage } from "@/components/ui/form-message";
import { SubmitButton } from "@/components/ui/submit-button";
import { changePassword, updateProfile } from "@/lib/actions/profile";
import type { ActionState, SessionUser } from "@/types";

export function ProfileForm({ user }: { user: SessionUser }) {
  const [state, formAction] = useActionState<ActionState, FormData>(updateProfile, {});
  const v = state.values ?? {};
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Full name" name="name" defaultValue={v.name ?? user.name} errors={state.errors?.name} />
        <Field label="Mobile number" name="phone" type="tel" inputMode="numeric" defaultValue={v.phone ?? user.phone} errors={state.errors?.phone} />
      </div>
      <Field label="Email" name="emailDisplay" defaultValue={user.email} disabled hint="Email cannot be changed" />
      <Field
        label="Profile image URL (optional)"
        name="profileImage"
        type="url"
        placeholder="https://…"
        defaultValue={v.profileImage ?? user.profileImage}
        errors={state.errors?.profileImage}
      />
      <SubmitButton pendingText="Saving…">Save changes</SubmitButton>
    </form>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<ActionState, FormData>(changePassword, {});
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormMessage state={state} />
      <Field label="Current password" name="currentPassword" type="password" autoComplete="current-password" errors={state.errors?.currentPassword} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="New password" name="newPassword" type="password" autoComplete="new-password" errors={state.errors?.newPassword} />
        <Field label="Confirm new password" name="confirmPassword" type="password" autoComplete="new-password" errors={state.errors?.confirmPassword} />
      </div>
      <SubmitButton className="btn-secondary" pendingText="Updating…">Change password</SubmitButton>
    </form>
  );
}
