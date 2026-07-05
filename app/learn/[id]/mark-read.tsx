"use client";

import { useEffect } from "react";
import { markCardRead } from "@/lib/learn-store";

/** Records the card as read in the local learn state (external store, not
 * React state — safe to write from an effect). */
export function MarkRead({ cardId }: { cardId: string }) {
  useEffect(() => {
    markCardRead(cardId);
  }, [cardId]);
  return null;
}
