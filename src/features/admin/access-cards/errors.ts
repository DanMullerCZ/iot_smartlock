import { Prisma } from "@/base/generated/prisma/client";

import type { AccessCardActionResult } from "./types";

export function mapAccessCardActionError(error: unknown): AccessCardActionResult | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2002") {
        return { success: false, message: "Card code already exists." };
    }

    if (error.code === "P2003") {
        return { success: false, message: "User not found." };
    }

    if (error.code === "P2025") {
        return { success: false, message: "Access card not found." };
    }

    return null;
}

export function mapAccessCardRouteError(error: unknown): Response | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2002") {
        return Response.json({ error: "Card code already exists" }, { status: 409 });
    }

    if (error.code === "P2003") {
        return Response.json({ error: "User not found" }, { status: 422 });
    }

    if (error.code === "P2025") {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return null;
}
