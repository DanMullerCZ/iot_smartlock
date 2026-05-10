import { Prisma } from "@/base/generated/prisma/client";

import type { UserActionResult } from "./types";

export function mapUserActionError(error: unknown): UserActionResult | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

    if (error.code === "P2002") return { success: false, message: "Email already in use." };
    if (error.code === "P2025") return { success: false, message: "User not found." };

    return null;
}

export function mapUserRouteError(error: unknown): Response | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return null;

    if (error.code === "P2002")
        return Response.json({ error: "Email already in use" }, { status: 409 });
    if (error.code === "P2025") return Response.json({ error: "Not found" }, { status: 404 });

    return null;
}
