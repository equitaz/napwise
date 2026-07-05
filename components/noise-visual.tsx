"use client";

import type { SoundKind } from "@/lib/types";

/**
 * The app's one signature flourish (brief 5.5): a subtle, honest hint of the
 * noise character behind the countdown. Pure CSS; killed globally by the
 * prefers-reduced-motion rule; pointer-events-none is load-bearing (painted
 * above later siblings otherwise it would eat taps — learned the hard way).
 */
export function NoiseVisual({ sound }: { sound: SoundKind }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 flex items-center justify-center"
    >
      {sound === "brown" && (
        <div className="size-80 rounded-full bg-rose/10 blur-3xl motion-safe:animate-breathe" />
      )}
      {sound === "white" && (
        <>
          <div className="absolute size-64 rounded-full border border-amber/20 motion-safe:animate-shimmer" />
          <div
            className="absolute size-80 rounded-full border border-amber/10 motion-safe:animate-shimmer"
            style={{ animationDelay: "-0.9s" }}
          />
          <div
            className="absolute size-96 rounded-full border border-amber/5 motion-safe:animate-shimmer"
            style={{ animationDelay: "-1.7s" }}
          />
        </>
      )}
      <div className="absolute size-72 rounded-full bg-amber/10 blur-3xl motion-safe:animate-breathe" />
    </div>
  );
}
