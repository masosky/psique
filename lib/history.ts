import { prisma } from "@/lib/prisma";
import { TRAITS } from "@/lib/traits";

// Every submission is stored as a TestAttempt with its own scores and
// timestamp, so a user's history is already on disk — this module is what
// finally reads it. A trait only has history once its test has been taken
// more than once.

export interface HistoryPoint {
  /** Epoch millis: charts need a numeric axis to space points by real time. */
  at: number;
  score: number;
}

export interface TraitHistory {
  trait: string;
  points: HistoryPoint[];
  first: number;
  last: number;
  /** Signed change from first to last measurement, in points of 0-100. */
  delta: number;
}

/** Attempts whose scores changed a trait by less than this are noise, not news. */
export const MEANINGFUL_DELTA = 5;

/**
 * Per-trait series for every trait measured at least twice, ordered by date
 * and sorted by how much the trait moved (largest absolute change first).
 */
export async function loadHistory(userId: string): Promise<TraitHistory[]> {
  const attempts = await prisma.testAttempt.findMany({
    where: { userId },
    select: { scores: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const series = new Map<string, HistoryPoint[]>();
  for (const attempt of attempts) {
    const scores = attempt.scores as Record<string, number>;
    for (const [trait, score] of Object.entries(scores ?? {})) {
      // Skip traits that no longer exist in the registry (removed tests).
      if (!TRAITS[trait] || typeof score !== "number") continue;
      const points = series.get(trait) ?? [];
      points.push({ at: attempt.createdAt.getTime(), score });
      series.set(trait, points);
    }
  }

  return [...series.entries()]
    .filter(([, points]) => points.length >= 2)
    .map(([trait, points]) => {
      const first = points[0].score;
      const last = points[points.length - 1].score;
      return { trait, points, first, last, delta: last - first };
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
}

/** Date of the oldest attempt, for "you've been tracking since…". */
export async function firstAttemptAt(userId: string): Promise<Date | null> {
  const first = await prisma.testAttempt.findFirst({
    where: { userId },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return first?.createdAt ?? null;
}
