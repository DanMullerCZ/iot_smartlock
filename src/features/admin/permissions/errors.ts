import { Prisma } from "@/base/generated/prisma/client";

import type { PermissionActionResult } from "./types";

export function mapPermissionActionError(error: unknown): PermissionActionResult | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2003") {
        return { success: false, message: "User or room not found." };
    }

    if (error.code === "P2025") {
        return { success: false, message: "Permission not found." };
    }

    return null;
}

export function mapPermissionRouteError(error: unknown): Response | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2003") {
        return Response.json({ error: "User or room not found" }, { status: 422 });
    }

    if (error.code === "P2025") {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return null;
}
