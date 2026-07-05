"use client";

import { useState } from "react";
import { patchDayCache } from "@/lib/day-cache-store";
import { getDictionary } from "@/lib/i18n";
import { patchSettings, useSettings } from "@/lib/settings-store";
import type { AvailableTime, SleepLastNight } from "@/lib/types";
import { KssSelector } from "../kss-selector";
import { OptionChips } from "../option-chips";

const dict = getDictionary();

const SLEEP_ORDER: readonly SleepLastNight[] = [
  "<5",
  "5-6",
  "6-7",
  "7-8",
  "8+",
  "unknown",
];
const TIME_ORDER: readonly AvailableTime[] = [
  "10-15",
  "20-25",
  "30-40",
  "60",
  "90+",
];
const ACTIVITY_ORDER = [
  "focus",
  "meeting",
  "exercise",
  "driving",
  "kids",
  "rest",
] as const;

/** First run only: the four questions, one per screen (brief 5.2). */
export function Wizard({
  onComplete,
}: {
  onComplete: (kss: number, sleep: SleepLastNight) => void;
}) {
  const settings = useSettings();
  const [step, setStep] = useState(0);
  const [kss, setKss] = useState<number | null>(null);
  const [sleep, setSleep] = useState<SleepLastNight | null>(null);

  const answered =
    step === 0 ? kss !== null : step === 1 ? sleep !== null : true;

  function handleNext() {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    if (kss !== null && sleep !== null) onComplete(kss, sleep);
  }

  return (
    <section className="flex flex-1 flex-col justify-center gap-8 py-10">
      <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber">
        {dict.questions.stepOf(step + 1, 4)}
      </p>

      {step === 0 && (
        <KssSelector
          name="wizard-kss"
          legend={dict.questions.kssTitle}
          microcopy={dict.questions.kssMicrocopy}
          value={kss}
          onChange={setKss}
        />
      )}

      {step === 1 && (
        <OptionChips
          name="wizard-sleep"
          legend={dict.questions.sleepTitle}
          microcopy={dict.questions.sleepMicrocopy}
          options={SLEEP_ORDER.map((value) => ({
            value,
            label: dict.questions.sleepOptions[value],
          }))}
          value={sleep}
          onChange={(value) => {
            setSleep(value);
            patchDayCache({ sleepLastNight: value });
          }}
        />
      )}

      {step === 2 && (
        <OptionChips
          name="wizard-time"
          legend={dict.questions.timeTitle}
          microcopy={dict.questions.timeMicrocopy}
          options={TIME_ORDER.map((value) => ({
            value,
            label: dict.questions.timeOptions[value],
          }))}
          value={settings.lastAvailableTime}
          onChange={(value) => patchSettings({ lastAvailableTime: value })}
        />
      )}

      {step === 3 && (
        <OptionChips
          name="wizard-activity"
          legend={dict.questions.activityTitle}
          microcopy={dict.questions.activityMicrocopy}
          options={ACTIVITY_ORDER.map((value) => ({
            value,
            label: dict.questions.activityOptions[value],
          }))}
          value={settings.lastActivityAfter}
          onChange={(value) => patchSettings({ lastActivityAfter: value })}
        />
      )}

      <div className="flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="min-h-12 rounded-2xl border border-ember-700 px-5 font-medium text-ink-muted transition-colors hover:border-amber/60 hover:text-ink"
          >
            {dict.common.back}
          </button>
        )}
        <button
          type="button"
          disabled={!answered}
          onClick={handleNext}
          className="min-h-12 flex-1 rounded-2xl bg-amber px-5 text-lg font-semibold text-on-amber transition-colors hover:bg-amber-bright disabled:opacity-40"
        >
          {dict.common.next}
        </button>
      </div>
    </section>
  );
}
