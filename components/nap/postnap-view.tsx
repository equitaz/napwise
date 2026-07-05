"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/i18n";
import type {
  FellAsleep,
  Grogginess,
  SleepOnsetBucket,
} from "@/lib/types";
import { KssSelector } from "../kss-selector";
import { OptionChips } from "../option-chips";

const dict = getDictionary();

export type PostNapAnswers = {
  kssAfter: number;
  fellAsleep: FellAsleep;
  sleepOnsetBucket: SleepOnsetBucket | null;
  grogginess: Grogginess;
};

const ONSET_ORDER: readonly SleepOnsetBucket[] = [
  "immediate",
  "<5",
  "5-10",
  "10-20",
  "20+",
];

/** Immediately on waking, max 4 questions (brief 5.6). */
export function PostNapView({
  onSave,
}: {
  onSave: (answers: PostNapAnswers) => void;
}) {
  const [kssAfter, setKssAfter] = useState<number | null>(null);
  const [fellAsleep, setFellAsleep] = useState<FellAsleep | null>(null);
  const [onset, setOnset] = useState<SleepOnsetBucket | null>(null);
  const [grogginess, setGrogginess] = useState<Grogginess | null>(null);

  const needsOnset = fellAsleep === "yes" || fellAsleep === "dozed";
  const ready =
    kssAfter !== null &&
    fellAsleep !== null &&
    grogginess !== null &&
    (!needsOnset || onset !== null);

  return (
    <section className="flex flex-1 flex-col gap-8 py-8">
      <h1 className="font-display text-4xl leading-tight text-ink">
        {dict.postnap.title}
      </h1>

      <KssSelector
        name="postnap-kss"
        legend={dict.postnap.kssTitle}
        value={kssAfter}
        onChange={setKssAfter}
      />

      <OptionChips
        name="postnap-fell-asleep"
        legend={dict.postnap.fellAsleepTitle}
        options={(["yes", "dozed", "rest_only"] as const).map((value) => ({
          value,
          label: dict.postnap.fellAsleepOptions[value],
        }))}
        value={fellAsleep}
        onChange={setFellAsleep}
      />

      {needsOnset && (
        <OptionChips
          name="postnap-onset"
          legend={dict.postnap.onsetTitle}
          microcopy={dict.postnap.onsetMicrocopy}
          options={ONSET_ORDER.map((value) => ({
            value,
            label: dict.postnap.onsetOptions[value],
          }))}
          value={onset}
          onChange={setOnset}
        />
      )}

      <OptionChips
        name="postnap-grogginess"
        legend={dict.postnap.grogginessTitle}
        options={(["none", "little", "moderate", "much"] as const).map(
          (value) => ({
            value,
            label: dict.postnap.grogginessOptions[value],
          }),
        )}
        value={grogginess}
        onChange={setGrogginess}
      />

      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          if (
            kssAfter === null ||
            fellAsleep === null ||
            grogginess === null
          ) {
            return;
          }
          onSave({
            kssAfter,
            fellAsleep,
            sleepOnsetBucket: needsOnset ? onset : null,
            grogginess,
          });
        }}
        className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright disabled:opacity-40"
      >
        {dict.postnap.save}
      </button>
    </section>
  );
}
