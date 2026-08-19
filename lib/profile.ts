import { prisma } from "@/lib/prisma";
import type { Profile } from "@/lib/insights";

// Vector de rasgos del usuario tal y como está ahora mismo.
export async function loadProfile(userId: string): Promise<Profile> {
  const rows = await prisma.traitScore.findMany({
    where: { userId },
    select: { trait: true, score: true },
  });
  return Object.fromEntries(rows.map((r) => [r.trait, r.score]));
}
