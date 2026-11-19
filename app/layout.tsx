import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ApplyFlow AI | Scholarship Evidence Assistant",
  description: "Demo RAG untuk tanya-jawab beasiswa berdasarkan dokumen simulasi dengan citation.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
