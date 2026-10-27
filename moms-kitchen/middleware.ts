import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/customer/:path*",
    "/provider/:path*",
    "/admin/:path*",
    "/checkout/:path*",
    "/profile/:path*",
  ],
};
