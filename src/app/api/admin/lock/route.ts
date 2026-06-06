import type { NextRequest } from "next/server";

import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { requireSuperAdminApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const roomId = sp.get("roomId") ? parseInt(sp.get("roomId")!, 10) : undefined;
    const includeDeleted = sp.get("includeDeleted") === "true";

    const where = {
        ...(roomId !== undefined && !isNaN(roomId) && { roomId }),
        ...(!includeDeleted && { deletedAt: null }),
    };

    const [locks, total] = await Promise.all([
        prisma.lock.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                room: { select: { id: true, name: true, location: true } },
            },
        }),
        prisma.lock.count({ where }),
    ]);

    return Response.json({ data: locks, meta: paginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    let body: { name?: string; description?: string; roomId?: number };
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, description, roomId } = body;

    if (roomId === undefined || isNaN(Number(roomId))) {
        return Response.json({ error: "roomId is required" }, { status: 400 });
    }

    try {
        const lock = await prisma.lock.create({
            data: {
                name: name ?? null,
                description: description ?? null,
                roomId: Number(roomId),
            },
            include: {
                room: { select: { id: true, name: true, location: true } },
            },
        });

        return Response.json({ data: lock }, { status: 201 });
    } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === "P2002") {
            return Response.json({ error: "A lock for this room already exists" }, { status: 409 });
        }
        if (code === "P2003") {
            return Response.json({ error: "Room not found" }, { status: 404 });
        }
        throw err;
    }
}