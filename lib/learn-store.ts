"use client";

import { createLocalStore } from "./local-store";
import type { LearnState } from "./types";

const learnStore = createLocalStore("learn", {
  readCardIds: [],
} as LearnState);

export function useLearnState(): LearnState {
  return learnStore.useValue();
}

export function markCardRead(cardId: string): void {
  learnStore.update((state) =>
    state.readCardIds.includes(cardId)
      ? { ...state, lastSeenCardId: cardId }
      : {
          ...state,
          lastSeenCardId: cardId,
          readCardIds: [...state.readCardIds, cardId],
        },
  );
}
