import Link from "next/link";
import { getDictionary } from "@/lib/i18n";

export default function Home() {
  const dict = getDictionary();
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center gap-12 px-6 py-16">
      <div>
        <h1 className="font-display text-7xl leading-none text-ink">
          {dict.app.name}
        </h1>
        <p className="mt-6 max-w-sm font-display text-xl italic leading-relaxed text-ink-muted">
          {dict.app.positioning}
        </p>
      </div>

      <div className="rounded-3xl border border-ember-800 bg-ember-900/60 p-6">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber">
          {dict.home.phaseTag}
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          {dict.home.phaseNote}
        </p>
        <Link
          href="/test-timer"
          className="mt-6 flex h-14 items-center justify-center rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
        >
          {dict.home.openLab}
        </Link>
      </div>

      <p className="text-sm text-ink-muted">{dict.app.privacy}</p>
    </main>
  );
}
