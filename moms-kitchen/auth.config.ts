import type { NextAuthConfig } from "next-auth";
import { roleHome } from "@/lib/roles";
import type { Role } from "@/types";

/** Area prefix -> role allowed inside it. */
const PROTECTED_AREAS: Array<[string, Role]> = [
  ["/customer", "CUSTOMER"],
  ["/provider", "PROVIDER"],
  ["/admin", "ADMIN"],
  ["/checkout", "CUSTOMER"],
];

function matches(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Edge-safe Auth.js config (no database access) shared by middleware.ts and auth.ts.
 * Middleware gives fast role-based redirects; every page and server action still
 * re-checks the user's role on the server against the database.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "dev-only-secret-set-AUTH_SECRET-in-env-local"
      : undefined),
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const role = auth?.user?.role as Role | undefined;

      if (matches(pathname, "/profile")) return Boolean(auth?.user);

      const area = PROTECTED_AREAS.find(([prefix]) => matches(pathname, prefix));
      if (!area) return true;
      // Not logged in -> redirect to /login?callbackUrl=...
      if (!auth?.user) return false;
      if (role !== area[1]) {
        return Response.redirect(new URL(roleHome(role), request.nextUrl));
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: Role }).role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
