import type { NextRequest } from "next/server";
import z from "zod";

import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";
import { roomCreateSchema } from "@/lib/validations/room";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const includeDeleted = sp.get("includeDeleted") === "true";
    const status = sp.get("status") ?? undefined;

    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(status && { status: status as never }),
    };

    const [rooms, total] = await Promise.all([
        prisma.room.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
        }),
        prisma.room.count({ where }),
    ]);

    return Response.json({ data: rooms, meta: paginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = roomCreateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    const room = await prisma.room.create({ data: parsed.data });
    return Response.json({ data: room }, { status: 201 });
}
