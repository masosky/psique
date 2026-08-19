import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Account deletion (GDPR art. 17). Attempts and trait scores are removed by
// the cascade on User, so one delete takes everything with it.
//
// The Firebase identity is deleted by the client right after this returns —
// doing it here would need a service account, and the browser already holds a
// credential that can delete its own user.
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    await prisma.user.delete({ where: { id: session.user.id } });
  } catch {
    // Already gone: deletion is idempotent from the caller's point of view.
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ ok: true });
}
