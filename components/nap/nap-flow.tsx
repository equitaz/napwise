"use client";

import { useEffect, useRef, useState } from "react";
import { NapAudioEngine } from "@/lib/audio";
import { getDictionary } from "@/lib/i18n";
import { useHydrated } from "@/lib/local-store";
import {
  completeOnboarding,
  useHasOnboarded,
} from "@/lib/onboarding-store";
import {
  recommendSession,
  type Recommendation,
  type Session,
} from "@/lib/recommend";
import { addSession, updateSession, useSessions } from "@/lib/sessions-store";
import { useSettings } from "@/lib/settings-store";
import type { FellAsleep, NapSession, SleepLastNight } from "@/lib/types";
import { setImmersive } from "@/lib/ui-store";
import { useCountdownSeconds } from "@/lib/use-countdown";
import { acquireWakeLock, type WakeLockHandle } from "@/lib/wake-lock";
import { CheckIn } from "./checkin";
import { NappingView } from "./napping-view";
import { PostNapView, type PostNapAnswers } from "./postnap-view";
import { PrepView } from "./prep-view";
import { RecommendationView } from "./recommendation-view";
import { ResultView } from "./result-view";
import { WakeView } from "./wake-view";
import { Wizard } from "./wizard";

const dict = getDictionary();

type Phase =
  | "intro"
  | "wizard"
  | "checkin"
  | "recommend"
  | "prep"
  | "napping"
  | "postnap"
  | "result";

/**
 * The whole Nap loop lives in ONE mounted component: check-in →
 * recommendation → timer → wake → post-nap → result. Route navigation during
 * a nap would unmount the AudioContext, so the bottom nav is hidden while
 * the timer runs (ui-store) and the wake view is derived from the countdown
 * reaching zero, exactly like the Phase 1 lab.
 */
export function NapFlow() {
  const hydrated = useHydrated();
  const hasOnboarded = useHasOnboarded();
  const settings = useSettings();
  const sessions = useSessions();

  const [phase, setPhase] = useState<Phase | null>(null);
  const [kssBefore, setKssBefore] = useState<number | null>(null);
  const [sleepAnswer, setSleepAnswer] = useState<SleepLastNight | null>(null);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(
    null,
  );
  const [chosen, setChosen] = useState<Session | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [kssAfter, setKssAfter] = useState<number | null>(null);
  const [fellAsleep, setFellAsleep] = useState<FellAsleep | null>(null);
  const [audioError, setAudioError] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const engineRef = useRef<NapAudioEngine | null>(null);
  const wakeLockRef = useRef<WakeLockHandle | null>(null);

  const effectivePhase: Phase =
    phase ?? (hasOnboarded ? "checkin" : "intro");

  const remainingSeconds = useCountdownSeconds(endsAt);
  const isWake = effectivePhase === "napping" && remainingSeconds === 0;

  function getEngine(): NapAudioEngine {
    if (!engineRef.current) engineRef.current = new NapAudioEngine();
    return engineRef.current;
  }

  // The bottom nav disappears while audio must stay alive.
  const immersive = effectivePhase === "napping";
  useEffect(() => {
    setImmersive(immersive);
    return () => setImmersive(false);
  }, [immersive]);

  // Vibration on wake — progressive enhancement, no-op on iOS Safari.
  useEffect(() => {
    if (isWake && "vibrate" in navigator) {
      navigator.vibrate([400, 200, 400]);
    }
  }, [isWake]);

  // Re-resume a suspended context when the tab becomes visible again.
  useEffect(() => {
    if (effectivePhase !== "napping") return;
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void engineRef.current?.resumeIfSuspended();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [effectivePhase]);

  // Leave nothing running if the component unmounts.
  useEffect(() => {
    return () => {
      void engineRef.current?.stop();
      wakeLockRef.current?.release();
      wakeLockRef.current = null;
    };
  }, []);

  function buildRecommendation(kss: number, sleep: SleepLastNight) {
    const now = new Date();
    const result = recommendSession({
      kss,
      sleepLastNight: sleep,
      availableTime: settings.lastAvailableTime,
      activityAfter: settings.lastActivityAfter,
      hour: now.getHours() + now.getMinutes() / 60,
      history: sessions,
    });
    setKssBefore(kss);
    setSleepAnswer(sleep);
    setRecommendation(result);
    setPhase("recommend");
  }

  function resetFlow() {
    setKssBefore(null);
    setSleepAnswer(null);
    setRecommendation(null);
    setChosen(null);
    setEndsAt(null);
    setSessionId(null);
    setKssAfter(null);
    setFellAsleep(null);
    setAudioError(false);
    setPhase("checkin");
  }

  async function handleBegin(seconds: number) {
    if (!chosen) return;
    const engine = getEngine();
    setAudioError(false);
    try {
      await engine.start({
        sound: settings.sound,
        volume: settings.volume,
        durationSeconds: seconds,
        noiseDuration: settings.noiseDuration,
      });
    } catch {
      setAudioError(true);
      return;
    }
    wakeLockRef.current = acquireWakeLock();
    setEndsAt(Date.now() + seconds * 1000);
    setPhase("napping");
    setAnnouncement(dict.timer.announceStarted(chosen.minutes));
  }

  function stopAudio() {
    void engineRef.current?.stop();
    wakeLockRef.current?.release();
    wakeLockRef.current = null;
  }

  function handleCancel() {
    stopAudio();
    setEndsAt(null);
    setAnnouncement(dict.timer.announceCancelled);
    resetFlow();
  }

  function handleAwake() {
    stopAudio();
    if (
      kssBefore === null ||
      sleepAnswer === null ||
      recommendation === null ||
      chosen === null
    ) {
      resetFlow();
      return;
    }
    const now = new Date();
    const record: NapSession = {
      id: crypto.randomUUID(),
      createdAt: now.toISOString(),
      timeOfDay: `${String(now.getHours()).padStart(2, "0")}:${String(
        now.getMinutes(),
      ).padStart(2, "0")}`,
      kssBefore,
      sleepLastNight: sleepAnswer,
      availableTime: settings.lastAvailableTime,
      activityAfter: settings.lastActivityAfter,
      recommendedMinutes: recommendation.session.minutes,
      chosenMinutes: chosen.minutes,
      usedCaffeine: false,
      kssAfter: null,
      fellAsleep: null,
      sleepOnsetBucket: null,
      grogginess: null,
      completedCheckin: false,
    };
    addSession(record);
    setSessionId(record.id);
    setEndsAt(null);
    setPhase("postnap");
  }

  function handlePostNapSave(answers: PostNapAnswers) {
    if (sessionId) {
      updateSession(sessionId, { ...answers, completedCheckin: true });
    }
    setKssAfter(answers.kssAfter);
    setFellAsleep(answers.fellAsleep);
    setPhase("result");
  }

  // Everything below depends on localStorage; render a quiet shell until the
  // client snapshot is in.
  if (!hydrated) {
    return <main className="min-h-dvh" aria-busy="true" />;
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-6 pb-24 pt-8">
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {effectivePhase === "intro" && (
        <section className="flex flex-1 flex-col justify-center gap-8 py-10">
          <h1 className="font-display text-6xl leading-none text-ink">
            {dict.app.name}
          </h1>
          <p className="text-lg leading-relaxed text-ink-muted">
            {dict.intro.body}
          </p>
          <p className="text-base font-medium text-amber-bright">
            {dict.app.privacy}
          </p>
          <button
            type="button"
            onClick={() => {
              completeOnboarding();
              setPhase("wizard");
            }}
            className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
          >
            {dict.intro.cta}
          </button>
        </section>
      )}

      {effectivePhase === "wizard" && (
        <Wizard onComplete={buildRecommendation} />
      )}

      {effectivePhase === "checkin" && (
        <CheckIn
          kss={kssBefore}
          onKssChange={setKssBefore}
          onConfirm={(sleep) => {
            if (kssBefore !== null) buildRecommendation(kssBefore, sleep);
          }}
        />
      )}

      {effectivePhase === "recommend" && recommendation && (
        <RecommendationView
          recommendation={recommendation}
          onStart={(session) => {
            setChosen(session);
            setPhase("prep");
          }}
          onSkipAccept={resetFlow}
          onBack={() => setPhase("checkin")}
        />
      )}

      {effectivePhase === "prep" && chosen && (
        <PrepView
          minutes={chosen.minutes}
          audioError={audioError}
          onBegin={(seconds) => void handleBegin(seconds)}
          onBack={() => setPhase("recommend")}
        />
      )}

      {effectivePhase === "napping" && !isWake && (
        <NappingView
          remainingSeconds={remainingSeconds ?? 0}
          onCancel={handleCancel}
          onVolumeChange={(volume) => engineRef.current?.setVolume(volume)}
        />
      )}

      {isWake && <WakeView onAwake={handleAwake} />}

      {effectivePhase === "postnap" && (
        <PostNapView onSave={handlePostNapSave} />
      )}

      {effectivePhase === "result" &&
        kssBefore !== null &&
        kssAfter !== null &&
        fellAsleep !== null && (
          <ResultView
            kssBefore={kssBefore}
            kssAfter={kssAfter}
            fellAsleep={fellAsleep}
            onDone={resetFlow}
          />
        )}
    </main>
  );
}
