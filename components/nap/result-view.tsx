"use client";

import { getDictionary } from "@/lib/i18n";
import type { FellAsleep } from "@/lib/types";

const dict = getDictionary();

/**
 * The one bright surface in the app (brief, Part 10) — you're awake now, the
 * UI should say so. Shows the delta plainly and never conflates rest with
 * sleep.
 */
export function ResultView({
  kssBefore,
  kssAfter,
  fellAsleep,
  onDone,
}: {
  kssBefore: number;
  kssAfter: number;
  fellAsleep: FellAsleep;
  onDone: () => void;
}) {
  const delta = kssBefore - kssAfter;
  const verdict =
    delta > 0
      ? dict.result.moreAlert(delta)
      : delta === 0
        ? dict.result.noChange
        : dict.result.moreSleepy(Math.abs(delta));

  return (
    <section className="fixed inset-0 z-30 overflow-y-auto bg-dawn text-dawn-ink">
      <div className="mx-auto flex min-h-full w-full max-w-md flex-col justify-center gap-8 px-6 py-16 pb-28">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-dawn-accent">
          {dict.result.title}
        </p>

        <div role="status">
          <p className="font-display text-5xl leading-tight">
            {dict.result.sleepiness(kssBefore, kssAfter)}
          </p>
          <p className="mt-4 text-xl leading-relaxed">{verdict}</p>
          {fellAsleep === "rest_only" && (
            <p className="mt-3 text-base leading-relaxed text-dawn-accent">
              {dict.result.restOnly}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={onDone}
          className="h-14 w-full rounded-2xl bg-dawn-ink text-lg font-semibold tracking-wide text-dawn transition-opacity hover:opacity-90"
        >
          {dict.result.done}
        </button>
      </div>
    </section>
  );
}
