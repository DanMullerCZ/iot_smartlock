import type { NextRequest } from "next/server";
import z from "zod";

import { prisma } from "@/lib/db";
import { accessCardUpdateSchema } from "@/lib/validations/access-card";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const card = await prisma.accessCard.findUnique({
        where: { id: numId },
        include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!card) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ data: card });
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

    const parsed = accessCardUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const card = await prisma.accessCard.update({
            where: { id: numId },
            data: parsed.data,
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return Response.json({ data: card });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2025") {
            return Response.json({ error: "Not found" }, { status: 404 });
        }
        if ((err as { code?: string }).code === "P2002") {
            return Response.json({ error: "Card code already exists" }, { status: 409 });
        }
        if ((err as { code?: string }).code === "P2003") {
            return Response.json({ error: "User not found" }, { status: 422 });
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
        await prisma.accessCard.update({
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
