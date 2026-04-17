import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
    server: {
        DATABASE_URL: z.string(),
        DATABASE_DIRECT_URL: z.string(),
        NEXTAUTH_SECRET: z.string().min(1),
        NEXTAUTH_URL: z.url(),
    },
    client: {},
    runtimeEnv: {
        DATABASE_URL: process.env.DATABASE_URL,
        DATABASE_DIRECT_URL: process.env.DATABASE_DIRECT_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    },
});
