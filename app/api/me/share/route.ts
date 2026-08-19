import { NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Share opt-in. Turning sharing off clears the id outright, so any link that
// was already sent stops resolving — revocation, not just hiding.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let body: { enabled?: boolean; politics?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  const userId = session.user.id;
  if (!body.enabled) {
    await prisma.user.update({
      where: { id: userId },
      data: { shareId: null, sharePolitics: false },
    });
    return NextResponse.json({ ok: true, shareId: null, politics: false });
  }

  const current = await prisma.user.findUnique({
    where: { id: userId },
    select: { shareId: true },
  });
  // Unguessable and stable: re-enabling keeps the same link unless revoked.
  const shareId = current?.shareId ?? randomBytes(9).toString("base64url");

  await prisma.user.update({
    where: { id: userId },
    data: { shareId, sharePolitics: Boolean(body.politics) },
  });
  return NextResponse.json({ ok: true, shareId, politics: Boolean(body.politics) });
}
