import type { ReactNode } from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <>
      <a
        href="#main-content"
        className={[
          "fixed left-4 top-3 z-50",
          "-translate-y-24 focus:translate-y-0",
          "rounded-xl bg-brand px-4 py-3",
          "font-semibold text-app-text",
          "shadow-lg transition-transform",
          "focus-visible:outline-2",
          "focus-visible:outline-offset-2",
          "focus-visible:outline-app-text",
        ].join(" ")}
      >
        Skip to main content
      </a>

      <div className="min-h-screen bg-app-background text-app-text lg:flex">
        <Sidebar />

        <div className="min-w-0 flex-1">
          <Header />
          {children}
        </div>
      </div>
    </>
  );
}
