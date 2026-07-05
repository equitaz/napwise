"use client";

import { useState } from "react";
import {
  patchDayCache,
  todaysSleep,
  todaysWakeTime,
  useDayCache,
} from "@/lib/day-cache-store";
import { getDictionary } from "@/lib/i18n";
import {
  bestLengthByAvgDelta,
  completedSessionCount,
  napWindowFromWake,
} from "@/lib/insights";
import { useSessions } from "@/lib/sessions-store";
import { patchSettings, useSettings } from "@/lib/settings-store";
import type { AvailableTime, SleepLastNight } from "@/lib/types";
import { chipBase, chipOff, chipOn } from "../chips";
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

type EditableGroup = "sleep" | "time" | "activity" | null;

/**
 * The Nap home on every repeat launch (brief 5.3): ONE screen. KSS is always
 * asked fresh; time + activity are prefilled chips from the last session;
 * last night's sleep is cached per calendar day.
 */
export function CheckIn({
  kss,
  onKssChange,
  onConfirm,
}: {
  kss: number | null;
  onKssChange: (value: number) => void;
  onConfirm: (sleep: SleepLastNight) => void;
}) {
  const settings = useSettings();
  const dayCache = useDayCache();
  const sessions = useSessions();

  const sleepToday = todaysSleep(dayCache);
  const wakeToday = todaysWakeTime(dayCache);
  const [expanded, setExpanded] = useState<EditableGroup>(
    sleepToday === null ? "sleep" : null,
  );
  const [wakeDraft, setWakeDraft] = useState("");

  const completed = completedSessionCount(sessions);
  const best = completed >= 5 ? bestLengthByAvgDelta(sessions, 2) : null;
  const dip =
    wakeToday && wakeToday !== "" ? napWindowFromWake(wakeToday) : null;

  const ready = kss !== null && sleepToday !== null;

  function chip(group: Exclude<EditableGroup, null>, label: string, value: string) {
    const active = expanded === group;
    return (
      <button
        type="button"
        aria-expanded={active}
        onClick={() => setExpanded(active ? null : group)}
        className={`${chipBase} ${active ? chipOn : chipOff}`}
      >
        <span className="text-xs uppercase tracking-wide opacity-70">
          {label}
        </span>
        {value}
      </button>
    );
  }

  return (
    <section className="flex flex-1 flex-col gap-8 py-8">
      <div>
        <h1 className="font-display text-4xl leading-tight text-ink">
          {dict.checkin.title}
        </h1>
        {best && (
          <p className="mt-3 text-sm text-amber-bright">
            {dict.checkin.bestLine(best.minutes)}
          </p>
        )}
      </div>

      <KssSelector
        name="checkin-kss"
        legend={dict.questions.kssTitle}
        value={kss}
        onChange={onKssChange}
      />

      <div>
        <div className="flex flex-wrap gap-2.5">
          {chip(
            "sleep",
            dict.checkin.sleepChipLabel,
            sleepToday === null
              ? "?"
              : dict.questions.sleepOptions[sleepToday],
          )}
          {chip(
            "time",
            dict.checkin.timeChipLabel,
            dict.questions.timeOptions[settings.lastAvailableTime],
          )}
          {chip(
            "activity",
            dict.checkin.activityChipLabel,
            dict.questions.activityOptions[settings.lastActivityAfter],
          )}
        </div>

        {expanded === "sleep" && (
          <div className="mt-4">
            <OptionChips
              name="checkin-sleep"
              legend={dict.questions.sleepTitle}
              microcopy={dict.questions.sleepMicrocopy}
              options={SLEEP_ORDER.map((value) => ({
                value,
                label: dict.questions.sleepOptions[value],
              }))}
              value={sleepToday}
              onChange={(value) => {
                patchDayCache({ sleepLastNight: value });
                setExpanded(null);
              }}
            />
          </div>
        )}
        {expanded === "time" && (
          <div className="mt-4">
            <OptionChips
              name="checkin-time"
              legend={dict.questions.timeTitle}
              microcopy={dict.questions.timeMicrocopy}
              options={TIME_ORDER.map((value) => ({
                value,
                label: dict.questions.timeOptions[value],
              }))}
              value={settings.lastAvailableTime}
              onChange={(value) => {
                patchSettings({ lastAvailableTime: value });
                setExpanded(null);
              }}
            />
          </div>
        )}
        {expanded === "activity" && (
          <div className="mt-4">
            <OptionChips
              name="checkin-activity"
              legend={dict.questions.activityTitle}
              microcopy={dict.questions.activityMicrocopy}
              options={ACTIVITY_ORDER.map((value) => ({
                value,
                label: dict.questions.activityOptions[value],
              }))}
              value={settings.lastActivityAfter}
              onChange={(value) => {
                patchSettings({ lastActivityAfter: value });
                setExpanded(null);
              }}
            />
          </div>
        )}
      </div>

      {/* Optional personal nap window (brief 5.9) — once per day. */}
      {wakeToday === null ? (
        <div className="rounded-3xl border border-ember-800 bg-ember-900/60 p-5">
          <label
            htmlFor="wake-time"
            className="block font-medium text-ink"
          >
            {dict.checkin.wakeQuestion}
          </label>
          <p className="mt-1 text-sm text-ink-muted">
            {dict.checkin.wakeOptionalHint}
          </p>
          <div className="mt-3 flex items-center gap-3">
            <input
              id="wake-time"
              type="time"
              value={wakeDraft}
              onChange={(event) => setWakeDraft(event.target.value)}
              className="min-h-11 rounded-xl border border-ember-700 bg-ember-950 px-3 text-ink"
            />
            <button
              type="button"
              disabled={wakeDraft === ""}
              onClick={() => patchDayCache({ wakeTime: wakeDraft })}
              className="min-h-11 rounded-full bg-amber px-5 text-sm font-semibold text-on-amber transition-colors hover:bg-amber-bright disabled:opacity-40"
            >
              {dict.common.next}
            </button>
            <button
              type="button"
              onClick={() => patchDayCache({ wakeTime: "" })}
              className="min-h-11 rounded-full px-3 text-sm font-medium text-ink-muted hover:text-ink"
            >
              {dict.checkin.wakeSkip}
            </button>
          </div>
        </div>
      ) : (
        dip && (
          <p className="text-sm text-ink-muted">
            {dict.checkin.dipLine(dip.start, dip.end)}
          </p>
        )
      )}

      <div>
        <button
          type="button"
          disabled={!ready}
          onClick={() => {
            if (sleepToday !== null) onConfirm(sleepToday);
          }}
          className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright disabled:opacity-40"
        >
          {dict.checkin.cta}
        </button>
        {!ready && (
          <p className="mt-2 text-center text-sm text-ink-muted">
            {dict.checkin.ctaHint}
          </p>
        )}
      </div>
    </section>
  );
}
