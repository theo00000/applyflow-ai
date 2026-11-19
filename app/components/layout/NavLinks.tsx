"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavLinksProps = {
  orientation?: "vertical" | "horizontal";
};

const navigation = [
  {
    label: "Discover Scholarships",
    shortLabel: "Discover",
    href: "/",
  },
  {
    label: "Ask AI",
    shortLabel: "Ask AI",
    href: "/ask",
  },
] as const;

export default function NavLinks({ orientation = "vertical" }: NavLinksProps) {
  const pathname = usePathname();
  const horizontal = orientation === "horizontal";

  return (
    <div
      className={horizontal ? "grid grid-cols-2 gap-2" : "flex flex-col gap-1"}
    >
      {navigation.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === "/" ||
              pathname === "/scholarships" ||
              Boolean(pathname?.startsWith("/scholarships/"))
            : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-label={item.label}
            aria-current={isActive ? "page" : undefined}
            className={[
              "inline-flex min-h-11 min-w-0 items-center",
              "rounded-xl py-3 text-sm font-medium",
              "transition-colors",
              "focus-visible:outline-2",
              "focus-visible:outline-offset-2",
              "focus-visible:outline-app-text",
              horizontal
                ? "w-full justify-center px-2"
                : "w-full justify-start px-4",
              isActive
                ? "bg-brand font-semibold text-app-text"
                : "text-neutral-600 hover:bg-neutral-100 hover:text-app-text",
            ].join(" ")}
          >
            {horizontal ? (
              <>
                <span className="sm:hidden">{item.shortLabel}</span>

                <span className="hidden sm:inline">{item.label}</span>
              </>
            ) : (
              item.label
            )}
          </Link>
        );
      })}
    </div>
  );
}
