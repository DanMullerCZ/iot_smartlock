/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { NextRequest } from "next/server";

import { jsonBigInt } from "@/lib/api/bigint";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const userId = sp.get("userId") ? parseInt(sp.get("userId")!, 10) : undefined;
    const roomId = sp.get("roomId") ? parseInt(sp.get("roomId")!, 10) : undefined;
    const cardId = sp.get("cardId") ? parseInt(sp.get("cardId")!, 10) : undefined;
    const from = sp.get("from") ? new Date(sp.get("from")!) : undefined;
    const to = sp.get("to") ? new Date(sp.get("to")!) : undefined;

    const where = {
        ...(userId !== undefined && !isNaN(userId) && { userId }),
        ...(roomId !== undefined && !isNaN(roomId) && { roomId }),
        ...(cardId !== undefined && !isNaN(cardId) && { cardId }),
        ...((from ?? to) && {
            requestedAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
            },
        }),
    };

    const [requests, total] = await Promise.all([
        prisma.accessRequest.findMany({
            where,
            skip,
            take: limit,
            orderBy: { requestedAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
                card: { select: { id: true, code: true, type: true } },
                room: { select: { id: true, name: true, location: true } },
                accessResult: true,
            },
        }),
        prisma.accessRequest.count({ where }),
    ]);

    return jsonBigInt({ data: requests, meta: paginationMeta(total, page, limit) });
}
