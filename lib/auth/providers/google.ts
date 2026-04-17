import GoogleProvider from "next-auth/providers/google";

import { env } from "@/lib/env";

export const GOOGLE_PROVIDER = GoogleProvider({
    clientId: env.GOOGLE_CLIENT_ID ?? "",
    clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
});
