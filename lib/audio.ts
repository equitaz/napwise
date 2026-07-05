import type { SoundKind } from "./types";

/**
 * The whole Phase 1 risk lives in this file (brief, Parts 3 & 8).
 *
 * Rules encoded here:
 * - ONE AudioContext per session, created inside the start-button gesture and
 *   resumed immediately — anything else gets blocked by iOS.
 * - Noise and alarm share that context. A context created later (while the
 *   screen is dim) would be blocked; the already-unlocked one is exactly why
 *   the alarm survives screen dimming.
 * - Everything is synthesized. No audio files.
 * - The alarm — noise fade + rising tone — is scheduled up front on the audio
 *   clock, so it fires even if JS timers are throttled by the time it's due.
 */

const NOISE_FADE_TIME_CONSTANT = 1.5; // s — eases the noise out at wake time
const RESUME_TIMEOUT_MS = 8000; // a blocked resume() hangs forever — surface it
// Owner feedback from the device test: 45 s from near-silence was too slow and
// too subtle. The wake is still a ramp (the honest "gentle wake"), but it now
// starts clearly audible and reaches full loudness in ~12 s.
const ALARM_RAMP_SECONDS = 12;
const ALARM_START_GAIN = 0.05;
const ALARM_PEAK_GAIN = 0.9;
const ALARM_MAX_SECONDS = 5 * 60; // ring for at most 5 min, then give up
const SILENT_FLOOR = 0.0001; // exponential ramps can't reach true zero

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext };

export type StartOptions = {
  sound: SoundKind;
  volume: number; // 0–1, applies to noise only
  durationSeconds: number;
};

export class NapAudioEngine {
  private ctx: AudioContext | null = null;
  private noiseGain: GainNode | null = null;
  private sound: SoundKind = "silent";

  get isRunning(): boolean {
    return this.ctx !== null;
  }

  get contextState(): AudioContextState | null {
    return this.ctx?.state ?? null;
  }

  /** MUST be called from a user gesture (tap/click) or iOS blocks audio. */
  async start(options: StartOptions): Promise<void> {
    if (this.ctx) await this.stop();

    const Ctor =
      window.AudioContext ?? (window as WebkitWindow).webkitAudioContext;
    if (!Ctor) throw new Error("Web Audio unsupported");

    const ctx = new Ctor();
    this.ctx = ctx;
    try {
      // Without a real user gesture, resume() stays pending forever instead
      // of rejecting — turn that silent hang into a visible failure.
      await withTimeout(ctx.resume(), RESUME_TIMEOUT_MS);
    } catch (error) {
      if (this.ctx === ctx) this.ctx = null;
      try {
        void ctx.close();
      } catch {
        // Already closed.
      }
      throw error;
    }
    if (this.ctx !== ctx) {
      // stop() won the race while resume() was in flight; ctx is closed.
      return;
    }

    const startAt = ctx.currentTime;
    const alarmAt = startAt + options.durationSeconds;
    const alarmEndsAt = alarmAt + ALARM_MAX_SECONDS;

    // Noise loop. For "silent" the buffer is zero-filled: inaudible, but it
    // keeps the unlocked context rendering so the scheduled alarm still fires.
    const source = ctx.createBufferSource();
    source.buffer = createNoiseBuffer(ctx, options.sound);
    source.loop = true;

    const noiseGain = ctx.createGain();
    noiseGain.gain.value =
      options.sound === "silent" ? 0 : clampVolume(options.volume);
    source.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    source.start(startAt);
    source.stop(alarmEndsAt);

    // Fade the noise as the wake tone begins.
    noiseGain.gain.setTargetAtTime(0, alarmAt, NOISE_FADE_TIME_CONSTANT);

    this.noiseGain = noiseGain;
    this.sound = options.sound;

    scheduleAlarm(ctx, alarmAt, alarmEndsAt);
  }

  /** Live volume change for the noise. The alarm level is not user-set. */
  setVolume(volume: number): void {
    if (!this.ctx || !this.noiseGain || this.sound === "silent") return;
    this.noiseGain.gain.setTargetAtTime(
      clampVolume(volume),
      this.ctx.currentTime,
      0.05,
    );
  }

  /** Call when the tab becomes visible again (brief, Part 8.1). */
  async resumeIfSuspended(): Promise<void> {
    if (this.ctx?.state === "suspended") {
      try {
        await this.ctx.resume();
      } catch {
        // Nothing to do — the user can restart the timer.
      }
    }
  }

  /** Stops noise and alarm and releases the context. */
  async stop(): Promise<void> {
    const ctx = this.ctx;
    this.ctx = null;
    this.noiseGain = null;
    if (ctx) {
      try {
        await ctx.close();
      } catch {
        // Already closed.
      }
    }
  }
}

function clampVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const id = setTimeout(() => reject(new Error("audio start timed out")), ms);
    promise.then(
      (value) => {
        clearTimeout(id);
        resolve(value);
      },
      (error) => {
        clearTimeout(id);
        reject(error);
      },
    );
  });
}

function createNoiseBuffer(ctx: AudioContext, sound: SoundKind): AudioBuffer {
  const length = ctx.sampleRate * 2; // ~2 s, looped
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (sound === "white") {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else if (sound === "brown") {
    // Integrated white noise (leaky running sum) — deeper, softer character.
    let last = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      last = (last + 0.02 * white) / 1.02;
      data[i] = Math.max(-1, Math.min(1, last * 3.5));
    }
  }
  // "silent": leave the buffer zero-filled.

  return buffer;
}

/**
 * The wake alarm: a rising three-note motif (A5 → C♯6 → E6) in a bright
 * triangle timbre, starting clearly audible and swelling to full loudness
 * over ~12 s. Honest — no sleep-stage claims — and it works because the
 * context was unlocked by the start gesture.
 */
function scheduleAlarm(
  ctx: AudioContext,
  alarmAt: number,
  alarmEndsAt: number,
): void {
  const osc = ctx.createOscillator();
  // Triangle has harmonics, so it cuts through where a pure sine gets lost.
  osc.type = "triangle";

  const note = ctx.createGain(); // per-note envelope
  const swell = ctx.createGain(); // the sunrise ramp
  note.gain.value = 0;
  swell.gain.setValueAtTime(ALARM_START_GAIN, alarmAt);
  swell.gain.exponentialRampToValueAtTime(
    ALARM_PEAK_GAIN,
    alarmAt + ALARM_RAMP_SECONDS,
  );

  osc.connect(note);
  note.connect(swell);
  swell.connect(ctx.destination);

  const NOTE_SECONDS = 0.3;
  const NOTE_GAP = 0.15;
  const PHRASE_REST = 0.7;
  const MOTIF_HZ = [880, 1108.73, 1318.51];

  let t = alarmAt;
  while (t < alarmEndsAt) {
    for (const freq of MOTIF_HZ) {
      osc.frequency.setValueAtTime(freq, t);
      note.gain.setValueAtTime(SILENT_FLOOR, t);
      note.gain.exponentialRampToValueAtTime(1, t + 0.02);
      note.gain.exponentialRampToValueAtTime(SILENT_FLOOR, t + NOTE_SECONDS);
      t += NOTE_SECONDS + NOTE_GAP;
    }
    t += PHRASE_REST;
  }

  osc.start(alarmAt);
  osc.stop(alarmEndsAt);
}
