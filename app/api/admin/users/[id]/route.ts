import type { NextRequest } from "next/server";
import z from "zod";

import { prisma } from "@/lib/db";
import { adminUserUpdateSchema } from "@/lib/validations/user";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    const numId = parseInt(id, 10);
    if (isNaN(numId)) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
        where: { id: numId },
        select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
        },
    });

    if (!user) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ data: user });
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

    const parsed = adminUserUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const user = await prisma.user.update({
            where: { id: numId },
            data: parsed.data,
            select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
                role: true,
                status: true,
                updatedAt: true,
            },
        });
        return Response.json({ data: user });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2025") {
            return Response.json({ error: "Not found" }, { status: 404 });
        }
        if ((err as { code?: string }).code === "P2002") {
            return Response.json({ error: "Email already in use" }, { status: 409 });
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
        await prisma.user.update({
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
