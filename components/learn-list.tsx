"use client";

import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import {
  LEARN_CARDS,
  LEARN_CATEGORY_ORDER,
  todaysCard,
} from "@/lib/learn-cards";
import { useLearnState } from "@/lib/learn-store";
import { useHydrated } from "@/lib/local-store";

const dict = getDictionary();

export function LearnList() {
  const hydrated = useHydrated();
  const learnState = useLearnState();
  // Today's card depends on the client's date; before hydration show the
  // first card so server and client HTML agree.
  const today = hydrated ? todaysCard() : LEARN_CARDS[0];

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-28 pt-8">
      <h1 className="font-display text-4xl leading-tight text-ink">
        {dict.learn.title}
      </h1>
      <p className="mt-2 text-base text-ink-muted">{dict.learn.intro}</p>

      <Link
        href={`/learn/${today.id}`}
        className="mt-6 block rounded-3xl border border-amber/50 bg-ember-900/70 p-5 transition-colors hover:border-amber"
      >
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber">
          {dict.learn.todays}
        </p>
        <p className="mt-2 font-display text-2xl leading-snug text-ink">
          {today.title}
        </p>
        <p className="mt-1 text-sm text-ink-muted">
          {dict.learn.categories[today.category]}
        </p>
      </Link>

      {LEARN_CATEGORY_ORDER.map((category) => (
        <section key={category} className="mt-8">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
            {dict.learn.categories[category]}
          </h2>
          <ul className="flex flex-col gap-2">
            {LEARN_CARDS.filter((card) => card.category === category).map(
              (card) => {
                const read = learnState.readCardIds.includes(card.id);
                return (
                  <li key={card.id}>
                    <Link
                      href={`/learn/${card.id}`}
                      className="flex min-h-12 items-center justify-between gap-3 rounded-2xl border border-ember-800 px-4 py-3 text-sm font-medium text-ink transition-colors hover:border-amber/60"
                    >
                      {card.title}
                      {read && (
                        <span
                          className="shrink-0 text-amber"
                          aria-label={dict.learn.read}
                        >
                          ✓
                        </span>
                      )}
                    </Link>
                  </li>
                );
              },
            )}
          </ul>
        </section>
      ))}
    </main>
  );
}
