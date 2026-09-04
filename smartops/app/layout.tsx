import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SmartOps — AI Agency Command Center",
  description: "A solo-founder AI agency management system: 15 AI agents run operations, technology, finance and marketing. The CEO only handles approvals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
