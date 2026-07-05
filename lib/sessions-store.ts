"use client";

import { createLocalStore } from "./local-store";
import type { NapSession } from "./types";

const sessionsStore = createLocalStore("sessions", [] as NapSession[]);

export function useSessions(): NapSession[] {
  return sessionsStore.useValue();
}

export function getSessions(): NapSession[] {
  return sessionsStore.get();
}

export function addSession(session: NapSession): void {
  sessionsStore.update((list) => [...list, session]);
}

export function updateSession(
  id: string,
  patch: Partial<NapSession>,
): void {
  sessionsStore.update((list) =>
    list.map((session) =>
      session.id === id ? { ...session, ...patch } : session,
    ),
  );
}
