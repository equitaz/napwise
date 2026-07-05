"use client";

import { getDictionary } from "@/lib/i18n";

const dict = getDictionary();

export function WakeView({ onAwake }: { onAwake: () => void }) {
  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-10 py-10 text-center motion-safe:animate-sunrise">
      <div className="relative flex flex-col items-center gap-4">
        {/* pointer-events-none is load-bearing: positioned elements paint
            (and hit-test) above the button below. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-10 size-80 rounded-full bg-amber/25 blur-3xl motion-safe:animate-breathe"
        />
        <h1
          role="alert"
          className="relative font-display text-5xl leading-tight text-amber-bright"
        >
          {dict.wake.title}
        </h1>
        <p className="relative text-base text-ink-muted">{dict.wake.body}</p>
      </div>

      <button
        type="button"
        onClick={onAwake}
        className="h-16 w-full rounded-2xl bg-amber text-xl font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
      >
        {dict.wake.awake}
      </button>
    </section>
  );
}
