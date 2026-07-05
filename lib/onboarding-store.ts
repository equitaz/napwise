"use client";

import { createLocalStore } from "./local-store";

const onboardingStore = createLocalStore("hasOnboarded", false);

export function useHasOnboarded(): boolean {
  return onboardingStore.useValue();
}

export function completeOnboarding(): void {
  onboardingStore.set(true);
}
