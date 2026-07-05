"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { NapAudioEngine } from "@/lib/audio";
import { getDictionary } from "@/lib/i18n";
import { patchSettings, useSettings } from "@/lib/settings-store";
import type { SoundKind } from "@/lib/types";
import { formatRemaining, useCountdownSeconds } from "@/lib/use-countdown";
import { acquireWakeLock, type WakeLockHandle } from "@/lib/wake-lock";

declare global {
  interface Window {
    __napwise?: { engine: NapAudioEngine };
  }
}

const dict = getDictionary();

const DURATIONS: ReadonlyArray<{
  seconds: number;
  label: string;
  hint?: string;
}> = [
  { seconds: 30, label: "30 sec", hint: "test" },
  { seconds: 60, label: "1 min" },
  { seconds: 5 * 60, label: "5 min" },
  { seconds: 10 * 60, label: "10 min" },
  { seconds: 20 * 60, label: "20 min" },
];

const SOUNDS: ReadonlyArray<{ value: SoundKind; label: string }> = [
  { value: "silent", label: dict.testTimer.soundSilent },
  { value: "white", label: dict.testTimer.soundWhite },
  { value: "brown", label: dict.testTimer.soundBrown },
];

const chipBase =
  "flex min-h-11 cursor-pointer select-none items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors";
const chipOn = "border-amber bg-amber/15 text-amber-bright";
const chipOff =
  "border-ember-700 text-ink-muted hover:border-amber/60 hover:text-ink";

function VolumeSlider({
  id,
  value,
  disabled,
  onChange,
  hint,
}: {
  id: string;
  value: number;
  disabled: boolean;
  onChange: (volume: number) => void;
  hint?: string;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-3 block text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted"
      >
        {dict.testTimer.volume}
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

export function TimerLab() {
  const [phase, setPhase] = useState<"setup" | "napping">("setup");
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [durationSeconds, setDurationSeconds] = useState<number>(10 * 60);
  const [announcement, setAnnouncement] = useState("");
  const [confirmingStop, setConfirmingStop] = useState(false);
  const [audioError, setAudioError] = useState(false);

  const engineRef = useRef<NapAudioEngine | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);

  const settings = useSettings();
  const remainingSeconds = useCountdownSeconds(endsAt);

  // Wake state is derived, not stored: the countdown reaching zero IS the
  // alarm. The audio side was already scheduled on the audio clock at start.
  const isAlarm = phase === "napping" && remainingSeconds === 0;

  function getEngine(): NapAudioEngine {
    if (!engineRef.current) engineRef.current = new NapAudioEngine();
    return engineRef.current;
  }

  // Vibration on wake — progressive enhancement, no-op on iOS Safari.
  useEffect(() => {
    if (isAlarm && "vibrate" in navigator) {
      navigator.vibrate([400, 200, 400]);
    }
  }, [isAlarm]);

  // Re-resume a suspended context when the tab becomes visible again.
  useEffect(() => {
    if (phase !== "napping") return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void engineRef.current?.resumeIfSuspended();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [phase]);

  // A first stop-tap arms the confirm step, then disarms after a beat.
  useEffect(() => {
    if (!confirmingStop) return;
    const id = window.setTimeout(() => setConfirmingStop(false), 4000);
    return () => window.clearTimeout(id);
  }, [confirmingStop]);

  // Leave nothing running if the component unmounts.
  useEffect(() => {
    return () => {
      void engineRef.current?.stop();
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, []);

  async function handleStart() {
    const engine = getEngine();
    try {
      await engine.start({
        sound: settings.sound,
        volume: settings.volume,
        durationSeconds,
      });
    } catch {
      setAudioError(true);
      return;
    }
    if (process.env.NODE_ENV !== "production") {
      window.__napwise = { engine };
    }
    wakeLockRef.current = acquireWakeLock();
    setEndsAt(Date.now() + durationSeconds * 1000);
    setPhase("napping");
    setConfirmingStop(false);
    const duration = DURATIONS.find((d) => d.seconds === durationSeconds);
    setAnnouncement(
      dict.testTimer.announceStarted(
        duration?.label ?? `${durationSeconds} sec`,
      ),
    );
  }

  function stopEverything(message: string) {
    void engineRef.current?.stop();
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
    setEndsAt(null);
    setPhase("setup");
    setConfirmingStop(false);
    setAnnouncement(message);
  }

  function handleStopTap() {
    if (!confirmingStop) {
      setConfirmingStop(true);
      return;
    }
    stopEverything(dict.testTimer.announceStopped);
  }

  function handleVolumeChange(volume: number) {
    patchSettings({ volume });
    engineRef.current?.setVolume(volume);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 py-8">
      <header className="flex items-baseline justify-between">
        <Link
          href="/"
          className="font-display text-xl italic text-ink transition-colors hover:text-amber-bright"
        >
          {dict.app.name}
        </Link>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber">
          {dict.home.phaseTag}
        </p>
      </header>

      {/* Start/stop announcements — start and end only, never every second. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {phase === "setup" && (
        <section className="flex flex-1 flex-col justify-center gap-9 py-10">
          <div>
            <h1 className="font-display text-5xl leading-tight text-ink">
              {dict.testTimer.title}
            </h1>
            <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-muted">
              {dict.testTimer.subtitle}
            </p>
          </div>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {dict.testTimer.duration}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {DURATIONS.map((duration) => {
                const selected = durationSeconds === duration.seconds;
                return (
                  <label
                    key={duration.seconds}
                    className={`${chipBase} ${selected ? chipOn : chipOff}`}
                  >
                    <input
                      type="radio"
                      name="duration"
                      className="sr-only"
                      checked={selected}
                      onChange={() => setDurationSeconds(duration.seconds)}
                    />
                    {duration.label}
                    {duration.hint && (
                      <span className="text-xs opacity-70">
                        · {duration.hint}
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
              {dict.testTimer.sound}
            </legend>
            <div className="flex flex-wrap gap-2.5">
              {SOUNDS.map((option) => {
                const selected = settings.sound === option.value;
                return (
                  <label
                    key={option.value}
                    className={`${chipBase} ${selected ? chipOn : chipOff}`}
                  >
                    <input
                      type="radio"
                      name="sound"
                      className="sr-only"
                      checked={selected}
                      onChange={() => patchSettings({ sound: option.value })}
                    />
                    {option.label}
                  </label>
                );
              })}
            </div>
          </fieldset>

          <VolumeSlider
            id="volume"
            value={settings.volume}
            disabled={settings.sound === "silent"}
            onChange={handleVolumeChange}
            hint={dict.testTimer.volumeSilentHint}
          />

          {audioError && (
            <p role="alert" className="text-sm font-medium text-rose">
              {dict.testTimer.audioError}
            </p>
          )}

          <button
            type="button"
            onClick={() => void handleStart()}
            className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
          >
            {dict.testTimer.start}
          </button>
        </section>
      )}

      {phase === "napping" && !isAlarm && (
        <section className="flex flex-1 flex-col items-center justify-center gap-10 py-10 text-center">
          <p className="text-sm text-ink-muted">{dict.testTimer.napping}</p>

          <div className="relative flex items-center justify-center">
            <div
              aria-hidden="true"
              className="absolute size-72 rounded-full bg-amber/10 blur-3xl motion-safe:animate-breathe"
            />
            <p
              aria-hidden="true"
              className="relative font-display text-8xl text-ink"
            >
              {formatRemaining(remainingSeconds ?? 0)
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
            <p className="font-medium text-ink">
              {dict.testTimer.keepScreenOn}
            </p>
            <p className="mt-2 text-sm text-ink-muted">
              {dict.testTimer.fallbackAlarm}
            </p>
          </div>

          {settings.sound !== "silent" && (
            <div className="w-full">
              <VolumeSlider
                id="volume-napping"
                value={settings.volume}
                disabled={false}
                onChange={handleVolumeChange}
              />
            </div>
          )}

          <button
            type="button"
            onClick={handleStopTap}
            className={`min-h-13 w-full rounded-2xl border text-base font-semibold transition-colors ${
              confirmingStop
                ? "border-rose bg-rose/15 text-rose"
                : "border-ember-700 text-ink-muted hover:border-amber/60 hover:text-ink"
            }`}
          >
            {confirmingStop ? dict.testTimer.confirmStop : dict.testTimer.stop}
          </button>

          <p className="text-xs text-ink-muted/80">
            {dict.testTimer.brightnessTip}
          </p>
        </section>
      )}

      {isAlarm && (
        <section className="flex flex-1 flex-col items-center justify-center gap-10 py-10 text-center motion-safe:animate-sunrise">
          <div className="relative flex flex-col items-center gap-4">
            <div
              aria-hidden="true"
              className="absolute -top-10 size-80 rounded-full bg-amber/25 blur-3xl motion-safe:animate-breathe"
            />
            <h1
              role="alert"
              className="relative font-display text-5xl leading-tight text-amber-bright"
            >
              {dict.testTimer.wakeTitle}
            </h1>
            <p className="relative text-base text-ink-muted">
              {dict.testTimer.wakeBody}
            </p>
          </div>

          <button
            type="button"
            onClick={() => stopEverything(dict.testTimer.announceStopped)}
            className="h-16 w-full rounded-2xl bg-amber text-xl font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
          >
            {dict.testTimer.awake}
          </button>
        </section>
      )}
    </main>
  );
}
