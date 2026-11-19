import Link from "next/link";
import NavLinks from "./NavLinks";

export default function Sidebar() {
  return (
    <aside
      aria-label="Application sidebar"
      className="
      hidden w-64 shrink-0 flex-col
      border-r border-app-border bg-app-surface
      lg:sticky lg:top-0 lg:flex
      lg:h-screen lg:overflow-y-auto
    "
    >
      <div className="px-6 py-7">
        <Link href="/" className="inline-flex items-center gap-3">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-xl bg-brand text-lg font-bold text-app-text"
          >
            A
          </span>

          <span className="text-xl font-bold tracking-tight">ApplyFlow</span>
        </Link>

        <p className="mt-2 text-xs text-neutral-500">
          Scholarship Discovery Platform
        </p>
      </div>

      <nav aria-label="Primary navigation" className="px-3">
        <NavLinks />
      </nav>

      <div className="mt-auto p-6">
        <p className="border-t border-app-border pt-5 text-xs text-neutral-500">
          Discover opportunities with clarity.
        </p>
      </div>
    </aside>
  );
}
