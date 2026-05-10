import { Prisma } from "@/base/generated/prisma/client";

import type { RoomActionResult } from "./types";

export function mapRoomActionError(error: unknown): RoomActionResult | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2025") {
        return { success: false, message: "Room not found." };
    }

    return null;
}

export function mapRoomRouteError(error: unknown): Response | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2025") {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return null;
}
