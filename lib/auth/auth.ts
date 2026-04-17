import type { NextAuthOptions } from "next-auth";

import { CREDENTIAL_PROVIDER } from "@/lib/auth/providers/credential";
import { GOOGLE_PROVIDER } from "@/lib/auth/providers/google";
import { env } from "@/lib/env";

export const authOptions: NextAuthOptions = {
    secret: env.NEXTAUTH_SECRET,
    providers: [CREDENTIAL_PROVIDER, GOOGLE_PROVIDER],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    callbacks: {
        jwt({ token }) {
            return token;
        },
        session({ session }) {
            return session;
        },
        signIn() {
            return true;
        },
    },
};
