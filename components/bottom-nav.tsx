"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { useImmersive } from "@/lib/ui-store";

const dict = getDictionary();

const TABS = [
  {
    href: "/",
    label: dict.nav.nap,
    icon: (
      // Crescent moon
      <path d="M20 12.5A8 8 0 1 1 11.5 4a6.5 6.5 0 0 0 8.5 8.5Z" />
    ),
  },
  {
    href: "/learn",
    label: dict.nav.learn,
    icon: (
      // Open book
      <path d="M12 6.5C10.5 5 8 4.5 4 4.5v13c4 0 6.5.5 8 2 1.5-1.5 4-2 8-2v-13c-4 0-6.5.5-8 2Zm0 0v13" />
    ),
  },
  {
    href: "/history",
    label: dict.nav.history,
    icon: (
      // Clock
      <path d="M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const immersive = useImmersive();

  // Hidden mid-nap (navigating would unmount the timer and kill the audio)
  // and on the isolated Phase 1 lab page.
  if (immersive || pathname.startsWith("/test-timer")) return null;

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ember-800 bg-ember-950/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <div className="mx-auto flex max-w-md">
        {TABS.map((tab) => {
          const active =
            tab.href === "/"
              ? pathname === "/"
              : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 py-2 text-xs font-medium transition-colors ${
                active ? "text-amber-bright" : "text-ink-muted hover:text-ink"
              }`}
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
