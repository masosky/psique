import { prisma } from "@/lib/prisma";
import type { Profile } from "@/lib/insights";

// The user's trait vector as it stands right now.
export async function loadProfile(userId: string): Promise<Profile> {
  const rows = await prisma.traitScore.findMany({
    where: { userId },
    select: { trait: true, score: true },
  });
  return Object.fromEntries(rows.map((r) => [r.trait, r.score]));
}
