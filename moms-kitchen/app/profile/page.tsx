import type { Metadata } from "next";
import Link from "next/link";
import { PasswordForm, ProfileForm } from "@/components/forms/profile-forms";
import { Badge } from "@/components/ui/badges";
import { ROLE_LABEL, roleHome } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { initials } from "@/lib/utils";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const user = await requireUser();
  return (
    <div className="container-page max-w-3xl py-8">
      <Link href={roleHome(user.role)} className="text-sm font-medium text-brand-700 hover:underline">← Back to dashboard</Link>
      <div className="mt-3 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-2xl font-bold text-brand-800">
          {initials(user.name)}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <Badge className="mt-1 bg-brand-100 text-brand-800">{ROLE_LABEL[user.role]}</Badge>
        </div>
      </div>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Personal details</h2>
        <ProfileForm user={user} />
      </section>

      <section className="card mt-6 p-5 sm:p-6">
        <h2 className="mb-4 text-lg font-bold">Change password</h2>
        <PasswordForm />
      </section>
    </div>
  );
}
