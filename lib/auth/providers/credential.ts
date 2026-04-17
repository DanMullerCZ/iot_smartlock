import CredentialsProvider from "next-auth/providers/credentials";
import type { Provider } from "next-auth/providers/index";
import { generatePreAuthToken } from "@/app/api/auth/login/route";

const TOKEN_TTL_MS = 30_000;

export const CREDENTIAL_PROVIDER: Provider = CredentialsProvider({
    name: "Credentials",
    credentials: {
        email:     { label: "Email",     type: "text" },
        uuid:      { label: "UUID",      type: "text" },
        name:      { label: "Name",      type: "text" },
        issuedAt:  { label: "IssuedAt",  type: "text" },
        token:     { label: "Token",     type: "text" },
    },
    async authorize(credentials) {
        if (!credentials?.email || !credentials?.uuid || !credentials?.name ||
            !credentials?.issuedAt || !credentials?.token) return null;

        const issuedAt = parseInt(credentials.issuedAt, 10);
        if (Date.now() - issuedAt > TOKEN_TTL_MS) return null;

        const expected = generatePreAuthToken(
            credentials.email,
            credentials.uuid,
            credentials.name,
            issuedAt,
        );
        if (expected !== credentials.token) return null;

        return { id: credentials.uuid, name: credentials.name, email: credentials.email };
    },
});