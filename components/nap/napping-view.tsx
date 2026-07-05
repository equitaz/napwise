"use client";

import { useEffect, useState } from "react";
import { getDictionary } from "@/lib/i18n";
import { patchSettings, useSettings } from "@/lib/settings-store";
import { formatRemaining } from "@/lib/use-countdown";
import { NoiseVisual } from "../noise-visual";
import { VolumeSlider } from "../volume-slider";

const dict = getDictionary();

/** The darkest screen in the app (brief 5.5). No snooze, no "+5 min" —
 * extending past the plan invites deeper sleep. Cancel needs a confirm. */
export function NappingView({
  remainingSeconds,
  onCancel,
  onVolumeChange,
}: {
  remainingSeconds: number;
  onCancel: () => void;
  onVolumeChange: (volume: number) => void;
}) {
  const settings = useSettings();
  const [confirmingCancel, setConfirmingCancel] = useState(false);

  useEffect(() => {
    if (!confirmingCancel) return;
    const id = window.setTimeout(() => setConfirmingCancel(false), 4000);
    return () => window.clearTimeout(id);
  }, [confirmingCancel]);

  const noiseAudible =
    settings.sound !== "silent" && settings.noiseDuration !== "off";

  return (
    <section className="flex flex-1 flex-col items-center justify-center gap-9 py-10 text-center">
      <p className="text-sm text-ink-muted">{dict.timer.napping}</p>

      <div className="relative flex items-center justify-center py-6">
        {noiseAudible ? (
          <NoiseVisual sound={settings.sound} />
        ) : (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute size-72 rounded-full bg-amber/10 blur-3xl motion-safe:animate-breathe"
          />
        )}
        <p
          aria-hidden="true"
          className="relative font-display text-8xl text-ink"
        >
          {formatRemaining(remainingSeconds)
            .split("")
            .map((char, index) => (
              <span
                key={index}
                className={`inline-block text-center ${
                  char === ":" ? "w-[0.34em] text-amber" : "w-[0.62em]"
                }`}
              >
                {char}
              </span>
            ))}
        </p>
      </div>

      <div className="w-full rounded-3xl border border-ember-800 bg-ember-900/60 p-5 text-left">
        <p className="font-medium text-ink">{dict.timer.keepScreenOn}</p>
        <p className="mt-2 text-sm text-ink-muted">
          {dict.timer.fallbackAlarm}
        </p>
      </div>

      {noiseAudible && (
        <div className="w-full">
          <VolumeSlider
            id="napping-volume"
            label={dict.timer.volume}
            value={settings.volume}
            disabled={false}
            onChange={(value) => {
              patchSettings({ volume: value });
              onVolumeChange(value);
            }}
          />
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (!confirmingCancel) {
            setConfirmingCancel(true);
            return;
          }
          onCancel();
        }}
        className={`min-h-13 w-full rounded-2xl border text-base font-semibold transition-colors ${
          confirmingCancel
            ? "border-rose bg-rose/15 text-rose"
            : "border-ember-700 text-ink-muted hover:border-amber/60 hover:text-ink"
        }`}
      >
        {confirmingCancel ? dict.timer.confirmCancel : dict.timer.cancel}
      </button>

      <p className="text-xs text-ink-muted/80">{dict.timer.brightnessTip}</p>
    </section>
  );
}
