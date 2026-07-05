"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/i18n";
import { patchSettings, useSettings } from "@/lib/settings-store";
import type { NoiseDuration, SoundKind } from "@/lib/types";
import { OptionChips } from "../option-chips";
import { VolumeSlider } from "../volume-slider";

const dict = getDictionary();

const SOUND_OPTIONS: readonly { value: SoundKind; label: string }[] = [
  { value: "silent", label: dict.timer.soundSilent },
  { value: "white", label: dict.timer.soundWhite },
  { value: "brown", label: dict.timer.soundBrown },
];

const NOISE_DURATION_OPTIONS: readonly {
  value: NoiseDuration;
  label: string;
}[] = [
  { value: "whole", label: dict.timer.noiseWhole },
  { value: "first10", label: dict.timer.noiseFirst10 },
  { value: "off", label: dict.timer.noiseOff },
];

/** Pre-nap setup (brief 5.5): sound, noise duration, volume. The Begin tap
 * is the user gesture that unlocks the AudioContext. */
export function PrepView({
  minutes,
  audioError,
  onBegin,
  onBack,
}: {
  minutes: number;
  audioError: boolean;
  onBegin: (seconds: number) => void;
  onBack: () => void;
}) {
  const settings = useSettings();
  const [devShort, setDevShort] = useState(false);
  const isDev = process.env.NODE_ENV !== "production";

  return (
    <section className="flex flex-1 flex-col gap-8 py-8">
      <div>
        <h1 className="font-display text-4xl leading-tight text-ink">
          {dict.timer.prepTitle}
        </h1>
        <p className="mt-2 font-display text-2xl text-amber">
          {dict.recommend.minutes(minutes)}
        </p>
      </div>

      <OptionChips
        name="prep-sound"
        legend={dict.timer.sound}
        options={SOUND_OPTIONS}
        value={settings.sound}
        onChange={(value) => patchSettings({ sound: value })}
      />

      {settings.sound !== "silent" && (
        <>
          <OptionChips
            name="prep-noise-duration"
            legend={dict.timer.noiseDuration}
            options={NOISE_DURATION_OPTIONS}
            value={settings.noiseDuration}
            onChange={(value) => patchSettings({ noiseDuration: value })}
          />
          <VolumeSlider
            id="prep-volume"
            label={dict.timer.volume}
            value={settings.volume}
            disabled={settings.noiseDuration === "off"}
            onChange={(value) => patchSettings({ volume: value })}
          />
        </>
      )}

      {isDev && (
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-ink-muted">
          <input
            type="checkbox"
            checked={devShort}
            onChange={(event) => setDevShort(event.target.checked)}
            className="size-5 accent-[color:var(--amber)]"
          />
          {dict.timer.devShort}
        </label>
      )}

      {audioError && (
        <p role="alert" className="text-sm font-medium text-rose">
          {dict.timer.audioError}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-3">
        <button
          type="button"
          onClick={() => onBegin(devShort ? 30 : minutes * 60)}
          className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
        >
          {dict.timer.begin}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          {dict.common.back}
        </button>
      </div>
    </section>
  );
}
