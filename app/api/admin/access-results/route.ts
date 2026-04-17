/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { NextRequest } from "next/server";

import { jsonBigInt } from "@/lib/api/bigint";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const result = sp.get("result") ?? undefined;
    const from = sp.get("from") ? new Date(sp.get("from")!) : undefined;
    const to = sp.get("to") ? new Date(sp.get("to")!) : undefined;

    const where = {
        ...(result && { result: result as never }),
        ...((from ?? to) && {
            completedAt: {
                ...(from && { gte: from }),
                ...(to && { lte: to }),
            },
        }),
    };

    const [results, total] = await Promise.all([
        prisma.accessResult.findMany({
            where,
            skip,
            take: limit,
            orderBy: { completedAt: "desc" },
            include: {
                accessRequest: {
                    include: {
                        user: { select: { id: true, name: true, email: true } },
                        card: { select: { id: true, code: true, type: true } },
                        room: { select: { id: true, name: true, location: true } },
                    },
                },
            },
        }),
        prisma.accessResult.count({ where }),
    ]);

    return jsonBigInt({ data: results, meta: paginationMeta(total, page, limit) });
}
