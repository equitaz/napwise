# Napwise

The nap app that tells you when *not* to nap, learns what actually works for you, and never pretends to read your brain. Installable PWA. No login, no cloud — all data stays in `localStorage` on the device.

## Status: Phase 1 — the alarm gate

Only the audio + alarm core is built (`/test-timer`). **Nothing else gets built until this passes on a physical iPhone.** If the alarm doesn't fire reliably, the answer is Capacitor, not more web features.

### The iPhone test (do this first)

1. Deploy to Netlify (see below) — the Wake Lock API needs HTTPS, so testing over `http://<lan-ip>:3000` will NOT keep the screen awake.
2. Open the deployed site in iOS Safari → **Alarm lab**.
3. Flip the ring/silent switch OFF silent and turn media volume up (iOS mutes Web Audio when the phone is on silent).
4. Start a 10 min timer, put the phone down screen-up, **don't lock it**, let the screen dim on its own.
5. Pass = the rising tone fires at zero and swells over ~45 s. Then run it again with White and Brown noise.

Expected behavior encoded in the copy: Wake Lock prevents *automatic* screen-off, not a manual lock. iOS suspends audio if you manually lock the phone or background Safari.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → out/
npm run lint
```

## Deploy (Netlify)

`netlify.toml` is already configured: build command `npm run build`, publish directory `out`. Either connect the repo in the Netlify UI or:

```bash
npx netlify-cli deploy --prod
```

## Architecture notes

- **Next.js App Router, static export** (`output: "export"`) — plain files, Capacitor-wrappable later with no rewrite.
- **`lib/audio.ts`** — the whole Phase 1 risk. One `AudioContext` per session, created inside the start-button gesture (iOS unlock), noise + alarm share it. Noise is synthesized (white = random samples, brown = leaky-integrated white). The alarm (noise fade + rising 3-note motif swelling over ~45 s) is scheduled up front on the audio clock so it fires even if JS timers are throttled.
- **`lib/wake-lock.ts`** — screen Wake Lock, re-acquired on `visibilitychange`, fails silently.
- **`lib/storage.ts`** — the ONE persistence seam. Every localStorage read/write goes through it (swappable for Capacitor Preferences later). Keys are prefixed `napwise:`.
- **`lib/i18n/`** — all copy behind an English dictionary from day one; Swedish is v1.5.
- **`lib/types.ts`** — the full data model from the brief (Part 7), including fields v1 logs but doesn't use yet.

### localStorage shape

| Key | Type | Notes |
| --- | --- | --- |
| `napwise:hasOnboarded` | `boolean` | set after the one-screen intro (Phase 2) |
| `napwise:settings` | `Settings` | sound, noise duration, volume, last check-in defaults, locale |
| `napwise:sessions` | `NapSession[]` | full before/after log per nap (Phase 2) |
| `napwise:dayCache` | `DayCache` | last-night's-sleep + wake time, cached per calendar day (Phase 2) |
| `napwise:learn` | `LearnState` | read-card tracking (Phase 2) |

See `lib/types.ts` for exact field definitions.

## Build order (from the brief — do not reorder)

1. **Phase 1 (done):** `/test-timer` — Wake Lock, synthesized white/brown noise, gentle-wake alarm ramp, honesty copy. **Gate: passes on a real iPhone.**
2. **Phase 2:** check-in → recommendation engine (pure, unit-tested) → timer → wake → post-nap → result loop; Learn library (25 sourced cards); History + best-length insight; 3-tab nav.

Kill list (never build): sleep-stage claims, snooze/+5 min, streaks, audio files, accounts, notifications/background alarms, paywall in the web app.
