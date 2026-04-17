import type { NextAuthOptions } from "next-auth";

import { CREDENTIAL_PROVIDER } from "@/lib/auth/providers/credential";
import { GOOGLE_PROVIDER } from "@/lib/auth/providers/google";
import { prisma } from "@/lib/db";
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
        async jwt({ token, user }) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (user) {
                token.id = user.id;
                const dbUser = await prisma.user.findUnique({
                    where: { uuid: user.id },
                    select: { role: true },
                });
                token.role = dbUser?.role ?? "USER";
            }
            return token;
        },
        session({ session, token }) {
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        signIn() {
            return true;
        },
    },
};
