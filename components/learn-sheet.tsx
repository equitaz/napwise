"use client";

import { useEffect, useRef } from "react";
import { getDictionary } from "@/lib/i18n";
import { getLearnCard } from "@/lib/learn-cards";
import { markCardRead } from "@/lib/learn-store";

const dict = getDictionary();

/**
 * Bottom sheet showing a Learn card by id — used from recommendation reasons
 * so reading the science never navigates away from (and never unmounts) the
 * nap flow.
 */
export function LearnSheet({
  cardId,
  onClose,
}: {
  cardId: string | null;
  onClose: () => void;
}) {
  const card = cardId ? getLearnCard(cardId) : undefined;
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!card) return;
    markCardRead(card.id);
    closeRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [card, onClose]);

  if (!card) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="learn-sheet-title"
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6"
    >
      <div
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative w-full max-w-md rounded-t-3xl border border-ember-700 bg-ember-900 p-6 pb-9 shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber">
            {dict.learn.categories[card.category]}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-full border border-ember-700 px-4 text-sm font-medium text-ink-muted transition-colors hover:border-amber/60 hover:text-ink"
          >
            {dict.common.close}
          </button>
        </div>
        <h2
          id="learn-sheet-title"
          className="mt-2 font-display text-2xl leading-snug text-ink"
        >
          {card.title}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          {card.body}
        </p>
        <p className="mt-4 text-sm italic text-ink-muted/90">
          {dict.learn.source}: {card.source}
        </p>
      </div>
    </div>
  );
}
