import { prisma } from "@/lib/prisma";
import {
  attachmentStyle,
  darkLevel,
  locusLevel,
  moralProfile,
  politicalArchetype,
  pusilanimeIndex,
  selfEsteemLevel,
  type Profile,
} from "@/lib/insights";

// What a public /r/<shareId> page is allowed to show. Built server-side from
// the owner's consent flags so the page never has to filter anything itself.
export interface SharedResult {
  name: string | null;
  traitCount: number;
  political: { key: string; traditional: boolean } | null;
  dark: { score: number; tier: string } | null;
  pusilanime: { score: number; tier: string } | null;
  attachment: { key: string } | null;
  moral: { key: string; top: string } | null;
  esteem: { score: number; tier: string } | null;
  locus: { score: number; tier: string } | null;
}

/**
 * Resolve a share link. Returns null when the id is unknown or sharing was
 * revoked. The political archetype requires its own explicit consent
 * (`sharePolitics`) because ideology is special-category data.
 */
export async function loadSharedResult(shareId: string): Promise<SharedResult | null> {
  const user = await prisma.user.findUnique({
    where: { shareId },
    select: { id: true, name: true, sharePolitics: true },
  });
  if (!user) return null;

  const rows = await prisma.traitScore.findMany({
    where: { userId: user.id },
    select: { trait: true, score: true },
  });
  if (rows.length === 0) return null;

  const profile: Profile = Object.fromEntries(rows.map((r) => [r.trait, r.score]));
  const moral = moralProfile(profile);

  return {
    name: user.name,
    traitCount: rows.length,
    political: user.sharePolitics ? politicalArchetype(profile) : null,
    dark: darkLevel(profile),
    pusilanime: pusilanimeIndex(profile),
    attachment: attachmentStyle(profile),
    moral: moral && { key: moral.key, top: moral.top },
    esteem: selfEsteemLevel(profile),
    locus: locusLevel(profile),
  };
}
