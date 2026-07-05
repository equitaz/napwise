import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n";
import { getLearnCard, LEARN_CARDS } from "@/lib/learn-cards";
import { MarkRead } from "./mark-read";

export const dynamicParams = false;

export function generateStaticParams() {
  return LEARN_CARDS.map((card) => ({ id: card.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const card = getLearnCard(id);
  return { title: card ? `${card.title} — Napwise` : "Learn — Napwise" };
}

export default async function LearnCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const card = getLearnCard(id);
  if (!card) notFound();

  const dict = getDictionary();

  return (
    <main className="mx-auto w-full max-w-md px-6 pb-28 pt-8">
      <MarkRead cardId={card.id} />
      <Link
        href="/learn"
        className="text-sm font-medium text-ink-muted transition-colors hover:text-ink"
      >
        ← {dict.learn.back}
      </Link>
      <p className="mt-6 text-xs font-medium uppercase tracking-[0.22em] text-amber">
        {dict.learn.categories[card.category]}
      </p>
      <h1 className="mt-2 font-display text-3xl leading-snug text-ink">
        {card.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-muted">
        {card.body}
      </p>
      <p className="mt-6 border-t border-ember-800 pt-4 text-sm italic text-ink-muted/90">
        {dict.learn.source}: {card.source}
      </p>
    </main>
  );
}
