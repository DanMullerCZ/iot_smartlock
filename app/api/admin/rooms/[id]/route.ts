import type { NextRequest } from "next/server";
import z from "zod";

import { prisma } from "@/lib/db";
import { roomUpdateSchema } from "@/lib/validations/room";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({ where: { id: numId } });
    if (!room) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ data: room });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = roomUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const room = await prisma.room.update({
            where: { id: numId },
            data: parsed.data,
        });
        return Response.json({ data: room });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2025") {
            return Response.json({ error: "Not found" }, { status: 404 });
        }
        throw err;
    }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    try {
        await prisma.room.update({
            where: { id: numId, deletedAt: null },
            data: { deletedAt: new Date() },
        });
        return new Response(null, { status: 204 });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2025") {
            return Response.json({ error: "Not found" }, { status: 404 });
        }
        throw err;
    }
}
