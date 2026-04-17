import type { NextRequest } from "next/server";
import z from "zod";

import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";
import { accessPermissionCreateSchema } from "@/lib/validations/access-permission";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const includeDeleted = sp.get("includeDeleted") === "true";
    const status = sp.get("status") ?? undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = sp.get("userId") ? parseInt(sp.get("userId")!, 10) : undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const roomId = sp.get("roomId") ? parseInt(sp.get("roomId")!, 10) : undefined;

    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(status && { status: status as never }),
        ...(userId !== undefined && !isNaN(userId) && { userId }),
        ...(roomId !== undefined && !isNaN(roomId) && { roomId }),
    };

    const [permissions, total] = await Promise.all([
        prisma.accessPermission.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { id: true, name: true, email: true } },
                room: { select: { id: true, name: true, location: true } },
            },
        }),
        prisma.accessPermission.count({ where }),
    ]);

    return Response.json({ data: permissions, meta: paginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = accessPermissionCreateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const permission = await prisma.accessPermission.create({
            data: parsed.data,
            include: {
                user: { select: { id: true, name: true, email: true } },
                room: { select: { id: true, name: true, location: true } },
            },
        });
        return Response.json({ data: permission }, { status: 201 });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2003") {
            return Response.json({ error: "User or room not found" }, { status: 422 });
        }
        throw err;
    }
}
