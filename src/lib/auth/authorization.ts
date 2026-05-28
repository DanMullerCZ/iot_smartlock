import { timingSafeEqual } from "crypto";

import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";

import { authOptions } from "@/lib/auth/auth";
import { env } from "@/lib/env";

export interface ActionAuthFailure {
    success: false;
    message: string;
}

function validateApiKey(req: NextRequest): boolean {
    const key = req.headers.get("x-api-key");
    if (!key) return false;

    const keys = (env.IOT_API_KEYS ?? "")
        .split(",")
        .map((k) => {
            return k.trim()
        })
        .filter(Boolean);

    console.log(`KeysLength: ${String(keys.length)} and incoming key '${key}'`);
    console.log(String((env.IOT_API_KEYS ?? "").length))

    const keyBuf = Buffer.from(key);
    return keys.some((k) => {
        const kBuf = Buffer.from(k);
        return kBuf.length === keyBuf.length && timingSafeEqual(kBuf, keyBuf);
    });
}

export async function requireSuperAdminApi(req: NextRequest): Promise<Response | null> {
    if (validateApiKey(req)) return null;

    const token = await getToken({ req, secret: env.NEXTAUTH_SECRET });

    if (!token) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (token.role !== "SUPER_ADMIN") {
        return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    return null;
}

export async function requireSuperAdminAction(): Promise<ActionAuthFailure | null> {
    const session = await getServerSession(authOptions);

    if (!session) {
        return { success: false, message: "Unauthorized." };
    }

    if (session.user.role !== "SUPER_ADMIN") {
        return { success: false, message: "Forbidden." };
    }

    return null;
}
