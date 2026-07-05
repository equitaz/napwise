"use client";

import { legendStyle } from "./chips";

export function VolumeSlider({
  id,
  label,
  value,
  disabled,
  onChange,
  hint,
}: {
  id: string;
  label: string;
  value: number;
  disabled: boolean;
  onChange: (volume: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className={legendStyle}>
        {label}
      </label>
      <input
        id={id}
        type="range"
        min={0}
        max={1}
        step={0.05}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-11 w-full disabled:opacity-40"
      />
      {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
    </div>
  );
}
