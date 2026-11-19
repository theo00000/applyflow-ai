import Link from "next/link";
import NavLinks from "./NavLinks";

export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-app-border bg-app-surface">
      <div className="flex min-h-16 items-center gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="inline-flex items-center gap-2 lg:hidden">
          <span
            aria-hidden="true"
            className="flex size-9 items-center justify-center rounded-lg bg-brand font-bold text-app-text"
          >
            A
          </span>

          <span className="font-bold tracking-tight">ApplyFlow</span>
        </Link>
        <div className="hidden lg:block">
          <p className="text-sm font-semibold">
            Scholarship Discovery Platform
          </p>

          <p className="text-xs text-neutral-500">
            Explore scholarships and ask with confidence.
          </p>
        </div>
      </div>

      <nav
        aria-label="Mobile navigation"
        className="border-t border-app-border px-4 py-2 lg:hidden"
      >
        <NavLinks orientation="horizontal" />
      </nav>
    </header>
  );
}
