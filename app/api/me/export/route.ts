import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Full data export (GDPR art. 20, portability). Includes the raw answers, not
// just the scores, so the file is genuinely everything we hold.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      traitScores: {
        select: { trait: true, score: true, updatedAt: true },
        orderBy: { trait: "asc" },
      },
      testAttempts: {
        select: { testSlug: true, version: true, answers: true, scores: true, createdAt: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const payload = {
    exportedAt: new Date().toISOString(),
    format: "psique-profile-v1",
    account: { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt },
    profile: user.traitScores,
    attempts: user.testAttempts,
  };

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="psique-${stamp}.json"`,
      // Personal data: never let a proxy or the browser keep a copy.
      "Cache-Control": "no-store",
    },
  });
}
