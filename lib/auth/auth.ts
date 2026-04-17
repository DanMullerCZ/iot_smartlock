import type { NextAuthOptions } from "next-auth";
import { CREDENTIAL_PROVIDER } from "@/lib/auth/providers/credential";
import { GOOGLE_PROVIDER } from "@/lib/auth/providers/google";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
  secret: env.NEXTAUTH_SECRET,
  providers: [
    CREDENTIAL_PROVIDER,
    GOOGLE_PROVIDER
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
    signIn({ user, account, profile, email, credentials }) {
      return true;
    }
  },
};