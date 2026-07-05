import type { Metadata } from "next";
import { HistoryList } from "@/components/history-list";

export const metadata: Metadata = {
  title: "History — Napwise",
  description: "Your past naps: before, after, and what actually worked.",
};

export default function HistoryPage() {
  return <HistoryList />;
}
