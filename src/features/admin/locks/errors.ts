import { Prisma } from "@/base/generated/prisma/client";

import type { LockActionResult } from "./types";

export function mapLockActionError(error: unknown): LockActionResult | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2003") {
        return { success: false, message: "Room not found." };
    }

    if (error.code === "P2025") {
        return { success: false, message: "Lock not found." };
    }

    return null;
}

export function mapLockRouteError(error: unknown): Response | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2003") {
        return Response.json({ error: "Room not found" }, { status: 404 });
    }

    if (error.code === "P2025") {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return null;
}
