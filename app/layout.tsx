import type { Metadata } from "next";
import type { ReactNode } from "react";

import AppShell from "./components/layout/AppShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApplyFlow | Scholarship Discovery Platform",
  description:
    "Explore scholarship information and ask AI questions grounded in available source documents.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
