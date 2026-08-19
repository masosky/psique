import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTest } from "@/lib/tests";
import { scoreTest, ScoringError, type Answers } from "@/lib/scoring";

// Envío de un test completo: puntúa, guarda el intento y actualiza el perfil
// (upsert de TraitScore por rasgo) en una transacción.
export async function POST(req: Request) {
  // Errores como códigos estables, no frases: el cliente decide el idioma.
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { testSlug?: string; answers?: Answers };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const test = body.testSlug ? getTest(body.testSlug) : undefined;
  if (!test) {
    return NextResponse.json({ error: "unknown_test" }, { status: 404 });
  }

  let scores;
  try {
    scores = scoreTest(test, body.answers ?? {});
  } catch (e) {
    if (e instanceof ScoringError) {
      return NextResponse.json({ error: "invalid_answers", detail: e.message }, { status: 400 });
    }
    throw e;
  }

  const userId = session.user.id;
  const attempt = await prisma.$transaction(async (tx) => {
    const created = await tx.testAttempt.create({
      data: {
        userId,
        testSlug: test.slug,
        version: test.version,
        answers: body.answers as object,
        scores,
      },
    });
    for (const [trait, score] of Object.entries(scores)) {
      await tx.traitScore.upsert({
        where: { userId_trait: { userId, trait } },
        create: { userId, trait, score, attemptId: created.id },
        update: { score, attemptId: created.id },
      });
    }
    return created;
  });

  return NextResponse.json({ ok: true, attemptId: attempt.id, scores });
}
