/* eslint-disable @typescript-eslint/no-non-null-assertion, @typescript-eslint/no-unnecessary-condition */
import type { NextAuthOptions, Session } from "next-auth";
import type { JWT } from "next-auth/jwt";

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
        async jwt({ token, user, account }): Promise<JWT> {
            if (account?.provider === "google") {
                const dbUser = await prisma.user.findUnique({
                    where: {
                        email: user.email!
                    },
                    select: {
                        uuid: true,
                        role: true,
                    }
                });
                token.id = dbUser!.uuid;
                token.role = dbUser!.role;
            } else {
                if (user) {
                    token.id = user.id;
                    const dbUser = await prisma.user.findUnique({
                        where: { uuid: user.id },
                        select: { role: true },
                    });
                    token.role = dbUser?.role ?? "USER";
                }
            }
            return token;
        },
        session({ session, token }): Session {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
            }
            return session;
        },
        async signIn({ user, account }): Promise<boolean> {
            if (account?.provider !== "google") {
                return true;
            }
            const existing = await prisma.user.findUnique({
                where: {
                    email: user.email!
                },
                select: {
                    status: true,
                    deletedAt: true
                }
            });

            if (existing?.deletedAt || existing?.status === "DISABLED") {
                return false;
            }

            await prisma.user.upsert({
                where: { email: user.email! },
                create: { email: user.email!, name: user.name ?? user.email!, status: "ACTIVE" },
                update: {},
            });

            return true;

        },
    },
};
