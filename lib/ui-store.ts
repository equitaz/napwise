"use client";

import { useSyncExternalStore } from "react";

/**
 * Tiny in-memory UI store (not persisted): the nap flow flips this while the
 * timer or wake screen is up so the bottom nav disappears — navigating away
 * would unmount the timer and kill the AudioContext mid-nap.
 */

let immersive = false;
const listeners = new Set<() => void>();

export function setImmersive(next: boolean): void {
  if (immersive === next) return;
  immersive = next;
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useImmersive(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => immersive,
    () => false,
  );
}
