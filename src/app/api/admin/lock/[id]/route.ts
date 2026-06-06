import type { NextRequest } from "next/server";

import { requireSuperAdminApi } from "@/lib/auth/authorization";
import { prisma } from "@/lib/db";

interface Params {
    params: Promise<{ id: string }>;
}

function parseId(id: string): number | null {
    const n = parseInt(id, 10);
    return isNaN(n) ? null : n;
}

export async function GET(req: NextRequest, { params }: Params) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    const { id } = await params;
    const lockId = parseId(id);
    if (lockId === null) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const lock = await prisma.lock.findUnique({
        where: { id: lockId },
        include: {
            room: { select: { id: true, name: true, location: true } },
        },
    });

    if (!lock) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ data: lock });
}

export async function PUT(req: NextRequest, { params }: Params) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    const { id } = await params;
    const lockId = parseId(id);
    if (lockId === null) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: { name?: string; description?: string; roomId?: number };
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { name, description, roomId } = body;

    try {
        const lock = await prisma.lock.update({
            where: { id: lockId },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(roomId !== undefined && { roomId: Number(roomId) }),
            },
            include: {
                room: { select: { id: true, name: true, location: true } },
            },
        });

        return Response.json({ data: lock });
    } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === "P2025") {
            return Response.json({ error: "Not found" }, { status: 404 });
        }
        if (code === "P2002") {
            return Response.json({ error: "A lock for this room already exists" }, { status: 409 });
        }
        if (code === "P2003") {
            return Response.json({ error: "Room not found" }, { status: 404 });
        }
        throw err;
    }
}

export async function DELETE(req: NextRequest, { params }: Params) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    const { id } = await params;
    const lockId = parseId(id);
    if (lockId === null) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        await prisma.lock.update({
            where: { id: lockId, deletedAt: null },
            data: { deletedAt: new Date() },
        });

        return new Response(null, { status: 204 });
    } catch (err: unknown) {
        const code = (err as { code?: string }).code;
        if (code === "P2025") {
            return Response.json({ error: "Not found" }, { status: 404 });
        }
        throw err;
    }
}