import type { Metadata } from "next";
import { TimerLab } from "./timer-lab";

export const metadata: Metadata = {
  title: "Alarm lab — Napwise",
  description:
    "Phase 1 gate: synthesized noise, wake lock and the gentle-wake alarm, tested in isolation.",
};

export default function TestTimerPage() {
  return <TimerLab />;
}
