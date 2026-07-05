"use client";

import { chipBase, chipOff, chipOn, legendStyle } from "./chips";

export type ChipOption<T extends string> = { value: T; label: string };

export function OptionChips<T extends string>({
  name,
  legend,
  microcopy,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  microcopy?: string;
  options: readonly ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className={legendStyle}>{legend}</legend>
      {microcopy && (
        <p className="-mt-1 mb-3 text-sm text-ink-muted">{microcopy}</p>
      )}
      <div className="flex flex-wrap gap-2.5">
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              className={`${chipBase} ${selected ? chipOn : chipOff}`}
            >
              <input
                type="radio"
                name={name}
                className="sr-only"
                checked={selected}
                onChange={() => onChange(option.value)}
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
