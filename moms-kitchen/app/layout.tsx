import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ToastProvider } from "@/components/ui/toaster";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Mom's Kitchen – Home Food & Tiffin Marketplace",
    template: "%s · Mom's Kitchen",
  },
  description:
    "Fresh homemade food from local kitchens. Discover home cooks and tiffin providers near you, order meals and track your order.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ea580c",
};

// There is intentionally no app/loading.tsx: with Next.js 15.5 a root loading
// boundary makes server-action redirects between pages of the same section
// (e.g. /provider/menu/new -> /provider/menu) hang in production builds.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <ToastProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
