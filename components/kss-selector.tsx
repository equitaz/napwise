"use client";

import { getDictionary } from "@/lib/i18n";
import { legendStyle } from "./chips";

const dict = getDictionary();

/** The Karolinska Sleepiness Scale, 1–9, as an accessible radio list.
 * Always asked fresh — it's the measurement, so it is never defaulted. */
export function KssSelector({
  name,
  legend,
  microcopy,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  microcopy?: string;
  value: number | null;
  onChange: (value: number) => void;
}) {
  return (
    <fieldset>
      <legend className={legendStyle}>{legend}</legend>
      {microcopy && (
        <p className="-mt-1 mb-3 text-sm text-ink-muted">{microcopy}</p>
      )}
      <div className="flex flex-col gap-1.5">
        {dict.kss.labels.map((label, index) => {
          const level = index + 1;
          const selected = value === level;
          return (
            <label
              key={level}
              className={`flex min-h-11 cursor-pointer select-none items-center gap-3 rounded-2xl border px-3.5 py-2 transition-colors ${
                selected
                  ? "border-amber bg-amber/15"
                  : "border-ember-800 hover:border-amber/50"
              }`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={selected}
                onChange={() => onChange(level)}
              />
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full font-display text-lg ${
                  selected
                    ? "bg-amber text-on-amber"
                    : "bg-ember-800 text-ink-muted"
                }`}
              >
                {level}
              </span>
              <span
                className={`text-sm leading-snug ${
                  selected ? "text-amber-bright" : "text-ink-muted"
                }`}
              >
                {label}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
