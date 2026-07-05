"use client";

import { useState } from "react";
import { getDictionary } from "@/lib/i18n";
import {
  SESSIONS,
  type Reason,
  type Recommendation,
  type Session,
} from "@/lib/recommend";
import { LearnSheet } from "../learn-sheet";

const dict = getDictionary();

function reasonText(reason: Reason): string {
  if (reason.code === "personal_best" && reason.minutes !== undefined) {
    return dict.recommend.personalBest(reason.minutes);
  }
  return dict.recommend.reasons[reason.code];
}

/**
 * One recommended session, with the actual reasons — each tappable to its
 * Learn card — and the rejected options with reasons-against (brief 5.4).
 * The transparency IS the product.
 */
export function RecommendationView({
  recommendation,
  onStart,
  onSkipAccept,
  onBack,
}: {
  recommendation: Recommendation;
  onStart: (session: Session) => void;
  onSkipAccept: () => void;
  onBack: () => void;
}) {
  const [showOther, setShowOther] = useState(false);
  const [sheetCardId, setSheetCardId] = useState<string | null>(null);
  const { session, reasons, rejected } = recommendation;
  const isSkip = session.key === "skip";

  return (
    <section className="flex flex-1 flex-col gap-7 py-8">
      <p className="text-base leading-relaxed text-ink-muted">
        {dict.recommend.basedOn}
      </p>

      <div>
        {isSkip && (
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.22em] text-amber">
            {dict.recommend.skipHeadline}
          </p>
        )}
        <h1 className="font-display text-5xl leading-tight text-ink">
          {dict.recommend.sessionNames[session.key]}
          {!isSkip && (
            <span className="text-amber">
              {" "}
              · {dict.recommend.minutes(session.minutes)}
            </span>
          )}
        </h1>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-ink-muted">
          {dict.recommend.whyTitle}
        </h2>
        <ul className="flex flex-col gap-2">
          {reasons.map((reason) => (
            <li key={reason.code}>
              <button
                type="button"
                onClick={() => setSheetCardId(reason.learnCardId)}
                className="flex w-full min-h-11 items-start gap-3 rounded-2xl border border-ember-800 bg-ember-900/50 px-4 py-3 text-left text-sm leading-snug text-ink transition-colors hover:border-amber/60"
              >
                <span aria-hidden="true" className="mt-0.5 text-amber">
                  •
                </span>
                {reasonText(reason)}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <button
          type="button"
          aria-expanded={showOther}
          onClick={() => setShowOther((v) => !v)}
          className="min-h-11 text-sm font-medium text-ink-muted underline-offset-4 transition-colors hover:text-ink hover:underline"
        >
          {dict.recommend.seeOther}
        </button>
        {showOther && (
          <ul className="mt-3 flex flex-col gap-2">
            {rejected.map((option) => (
              <li
                key={option.session.key}
                className="flex items-center justify-between gap-3 rounded-2xl border border-ember-800 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-ink">
                    {dict.recommend.sessionNames[option.session.key]}
                    {option.session.minutes > 0 && (
                      <span className="text-ink-muted">
                        {" "}
                        · {dict.recommend.minutes(option.session.minutes)}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {dict.recommend.rejects[option.code]}
                  </p>
                </div>
                {option.session.key !== "skip" && (
                  <button
                    type="button"
                    onClick={() => onStart(option.session)}
                    className="min-h-11 shrink-0 rounded-full border border-ember-700 px-4 text-xs font-semibold text-ink-muted transition-colors hover:border-amber hover:text-amber-bright"
                  >
                    {dict.recommend.choose}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {isSkip ? (
          <>
            <button
              type="button"
              onClick={onSkipAccept}
              className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
            >
              {dict.recommend.skipAccept}
            </button>
            <button
              type="button"
              onClick={() => onStart(SESSIONS.micro)}
              className="min-h-12 w-full rounded-2xl border border-ember-700 font-medium text-ink-muted transition-colors hover:border-amber/60 hover:text-ink"
            >
              {dict.recommend.napAnyway(SESSIONS.micro.minutes)}
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => onStart(session)}
            className="h-14 w-full rounded-2xl bg-amber text-lg font-semibold tracking-wide text-on-amber transition-colors hover:bg-amber-bright"
          >
            {dict.recommend.start(session.minutes)}
          </button>
        )}
        <button
          type="button"
          onClick={onBack}
          className="min-h-11 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
        >
          {dict.recommend.back}
        </button>
      </div>

      <LearnSheet cardId={sheetCardId} onClose={() => setSheetCardId(null)} />
    </section>
  );
}
