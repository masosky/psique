import { prisma } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Population statistics (real users + calibration seeds).
// All in SQL: Postgres ships corr() and percentiles out of the box.
// ---------------------------------------------------------------------------

export interface TraitCorrelation {
  a: string;
  b: string;
  r: number;
  n: number;
}

// The user's percentile (0-100) on each trait of their profile, in one query.
// Uses midrank: (below + ties/2) / n.
export async function percentilesFor(
  profile: Record<string, number>,
): Promise<Record<string, number>> {
  const traits = Object.keys(profile);
  if (traits.length === 0) return {};
  const values = traits.map((t) => profile[t]);

  const rows = await prisma.$queryRaw<{ trait: string; n: number; below: number; equal: number }[]>`
    SELECT t.trait,
           count(*)::int                                    AS n,
           (count(*) FILTER (WHERE t.score < u.val))::int   AS below,
           (count(*) FILTER (WHERE t.score = u.val))::int   AS equal
    FROM trait_scores t
    JOIN unnest(${traits}::text[], ${values}::float8[]) AS u(trait, val)
      ON u.trait = t.trait
    GROUP BY t.trait
  `;

  const out: Record<string, number> = {};
  for (const row of rows) {
    if (row.n === 0) continue;
    out[row.trait] = Math.round(((row.below + row.equal / 2) / row.n) * 100);
  }
  return out;
}

// Pearson correlations between trait pairs across the whole community.
// Only pairs with a large enough sample and a non-trivial effect.
export async function communityCorrelations(limit = 14): Promise<TraitCorrelation[]> {
  const rows = await prisma.$queryRaw<{ a: string; b: string; r: number | null; n: number }[]>`
    SELECT t1.trait                        AS a,
           t2.trait                        AS b,
           corr(t1.score, t2.score)        AS r,
           count(*)::int                   AS n
    FROM trait_scores t1
    JOIN trait_scores t2
      ON t1.user_id = t2.user_id AND t1.trait < t2.trait
    GROUP BY 1, 2
    HAVING count(*) >= 50 AND abs(corr(t1.score, t2.score)) >= 0.15
    ORDER BY abs(corr(t1.score, t2.score)) DESC
    LIMIT ${limit}
  `;
  return rows.filter((r): r is TraitCorrelation => r.r !== null);
}

export async function populationCount(): Promise<number> {
  const rows = await prisma.$queryRaw<{ n: number }[]>`
    SELECT count(DISTINCT user_id)::int AS n FROM trait_scores
  `;
  return rows[0]?.n ?? 0;
}

// Population sample on 3 political axes, to render the point cloud around
// the user in the 2D/3D compass.
export async function politicalCloud(
  sample = 220,
): Promise<{ econ: number; auth: number; cult: number }[]> {
  return prisma.$queryRaw<{ econ: number; auth: number; cult: number }[]>`
    SELECT e.score AS econ, a.score AS auth, c.score AS cult
    FROM trait_scores e
    JOIN trait_scores a ON a.user_id = e.user_id AND a.trait = 'auth'
    JOIN trait_scores c ON c.user_id = e.user_id AND c.trait = 'cult'
    WHERE e.trait = 'econ'
    ORDER BY md5(e.user_id)
    LIMIT ${sample}
  `;
}
