/** Shared chip-radio styling. Focus is surfaced on the label via the
 * `label:has(input:focus-visible)` rule in globals.css. */
export const chipBase =
  "flex min-h-11 cursor-pointer select-none items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors";
export const chipOn = "border-amber bg-amber/15 text-amber-bright";
export const chipOff =
  "border-ember-700 text-ink-muted hover:border-amber/60 hover:text-ink";

export const legendStyle =
  "mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted";
