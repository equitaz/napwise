"use client";

import { getDictionary } from "@/lib/i18n";
import {
  bestLengthByAvgDelta,
  completedSessionCount,
} from "@/lib/insights";
import { useHydrated } from "@/lib/local-store";
import { useSessions } from "@/lib/sessions-store";

const dict = getDictionary();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/** Simple list (brief 5.8): date, time, length, KSS before → after, delta.
 * No charts in v1. */
export function HistoryList() {
  const hydrated = useHydrated();
  const sessions = useSessions();

  const ordered = [...sessions].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
  const best =
    completedSessionCount(sessions) >= 5
      ? bestLengthByAvgDelta(sessions, 2)
      : null;

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-28 pt-8">
      <h1 className="font-display text-4xl leading-tight text-ink">
        {dict.history.title}
      </h1>

      {best && (
        <p className="mt-3 text-sm text-amber-bright">
          {dict.history.bestLine(best.minutes)}
        </p>
      )}

      {hydrated && ordered.length === 0 && (
        <p className="mt-8 text-base leading-relaxed text-ink-muted">
          {dict.history.empty}
        </p>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {hydrated &&
          ordered.map((session) => {
            const complete =
              session.completedCheckin && session.kssAfter !== null;
            const delta = complete
              ? session.kssBefore - (session.kssAfter as number)
              : null;
            return (
              <li
                key={session.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ember-800 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {formatDate(session.createdAt)} · {session.timeOfDay} ·{" "}
                    {session.chosenMinutes} min
                  </p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {complete
                      ? `KSS ${session.kssBefore} → ${session.kssAfter}`
                      : dict.history.notCompleted}
                  </p>
                </div>
                {delta !== null && (
                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-sm font-semibold ${
                      delta > 0
                        ? "bg-amber/15 text-amber-bright"
                        : "bg-ember-800 text-ink-muted"
                    }`}
                  >
                    {dict.history.delta(delta)}
                  </span>
                )}
              </li>
            );
          })}
      </ul>
    </main>
  );
}
