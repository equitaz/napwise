import type { Metadata } from "next";
import { LearnList } from "@/components/learn-list";

export const metadata: Metadata = {
  title: "Learn — Napwise",
  description: "Short, sourced sleep science. No vibes, no brain-reading.",
};

export default function LearnPage() {
  return <LearnList />;
}
