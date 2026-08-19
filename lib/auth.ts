import NextAuth, { type DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";
import { firebaseConfig } from "@/lib/firebase-config";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

// Firebase signs ID tokens with Google's securetoken keys; verifying against
// the public JWKS needs no service account. Module-level so the key set is
// cached (and refreshed) across requests.
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"),
);

// Identity lives in Firebase (email/password, Google, password resets); the
// server session stays NextAuth. The client signs in with Firebase, gets an
// ID token, and exchanges it here for a session bound to our Prisma user.
async function verifyFirebaseToken(idToken: string) {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${firebaseConfig.projectId}`,
    audience: firebaseConfig.projectId,
  });
  return payload as { sub: string; email?: string; name?: string };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // Behind a TLS-terminating proxy, pinning secure cookies in production
  // avoids the CSRF cookie-name dance (__Host- vs plain) between
  // GET /csrf and POST /callback.
  trustHost: true,
  useSecureCookies: process.env.NODE_ENV === "production",
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      id: "firebase",
      name: "Firebase",
      credentials: {
        idToken: { label: "ID token", type: "text" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.idToken) return null;

        let claims;
        try {
          claims = await verifyFirebaseToken(credentials.idToken as string);
        } catch {
          return null;
        }
        const email = claims.email?.toLowerCase();
        if (!email) return null;

        // Prefer the explicit name from the signup form, then the token claim
        // (Google profile); never overwrite an existing name with nothing.
        const name = (credentials.name as string | undefined)?.trim() || claims.name || null;

        // Match by Firebase UID first, then by email (links accounts created
        // before Firebase, and email/password ↔ Google logins to one row).
        const existing =
          (await prisma.user.findUnique({ where: { firebaseUid: claims.sub } })) ??
          (await prisma.user.findUnique({ where: { email } }));

        const user = existing
          ? await prisma.user.update({
              where: { id: existing.id },
              data: { firebaseUid: claims.sub, email, name: existing.name ?? name },
            })
          : await prisma.user.create({
              data: { firebaseUid: claims.sub, email, name },
            });

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.id) session.user.id = token.id as string;
      return session;
    },
  },
});
