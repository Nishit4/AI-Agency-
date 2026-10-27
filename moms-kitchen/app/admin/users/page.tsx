import { Search } from "lucide-react";
import type { Metadata } from "next";
import { ActionButton } from "@/components/ui/action-button";
import { Badge } from "@/components/ui/badges";
import { PageHeader } from "@/components/ui/page-header";
import { toggleUserActive } from "@/lib/actions/admin";
import { listUsers } from "@/lib/data/admin";
import { ROLE_LABEL } from "@/lib/roles";
import { requireUser } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import { ROLES, type Role } from "@/types";

export const metadata: Metadata = { title: "Users" };

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string }> }) {
  const admin = await requireUser(["ADMIN"]);
  const { q, role: rawRole } = await searchParams;
  const role = ROLES.includes(rawRole as Role) ? (rawRole as Role) : "";
  const users = await listUsers({ q: q?.trim(), role });

  return (
    <>
      <PageHeader title="Users" description="Search, view and block or unblock accounts." />
      <form className="card mb-5 grid grid-cols-1 gap-3 p-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]">
        <label className="relative">
          <span className="sr-only">Search users</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
          <input name="q" defaultValue={q} placeholder="Name, email or phone" className="input pl-9" />
        </label>
        <label>
          <span className="sr-only">Role</span>
          <select name="role" defaultValue={role} className="input">
            <option value="">All roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{ROLE_LABEL[r]}</option>
            ))}
          </select>
        </label>
        <button type="submit" className="btn-primary">Filter</button>
      </form>

      <div className="card p-2 sm:p-4">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="font-medium">{user.name}</td>
                  <td>
                    <p>{user.email}</p>
                    <p className="text-xs text-stone-500">{user.phone}</p>
                  </td>
                  <td>
                    <Badge className={user.role === "ADMIN" ? "bg-ink text-white" : user.role === "PROVIDER" ? "bg-brand-100 text-brand-800" : "bg-sky-100 text-sky-800"}>
                      {ROLE_LABEL[user.role]}
                    </Badge>
                  </td>
                  <td className="whitespace-nowrap text-stone-600">{formatDate(user.createdAt)}</td>
                  <td>
                    <Badge className={user.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                      {user.isActive ? "Active" : "Blocked"}
                    </Badge>
                  </td>
                  <td className="text-right">
                    {user.id !== admin.id && (
                      <ActionButton
                        action={toggleUserActive.bind(null, user.id)}
                        confirmMessage={user.isActive ? `Block ${user.name}? They will not be able to log in.` : undefined}
                        className={user.isActive ? "btn-secondary btn-sm text-red-700" : "btn-success btn-sm"}
                      >
                        {user.isActive ? "Block" : "Unblock"}
                      </ActionButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {users.length === 0 && <p className="p-4 text-center text-sm text-stone-600">No users found.</p>}
      </div>
    </>
  );
}
