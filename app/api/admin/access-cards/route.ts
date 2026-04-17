import type { NextRequest } from "next/server";
import z from "zod";

import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";
import { accessCardCreateSchema } from "@/lib/validations/access-card";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const includeDeleted = sp.get("includeDeleted") === "true";
    const status = sp.get("status") ?? undefined;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const userId = sp.get("userId") ? parseInt(sp.get("userId")!, 10) : undefined;

    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(status && { status: status as never }),
        ...(userId !== undefined && !isNaN(userId) && { userId }),
    };

    const [cards, total] = await Promise.all([
        prisma.accessCard.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: { user: { select: { id: true, name: true, email: true } } },
        }),
        prisma.accessCard.count({ where }),
    ]);

    return Response.json({ data: cards, meta: paginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = accessCardCreateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const card = await prisma.accessCard.create({
            data: parsed.data,
            include: { user: { select: { id: true, name: true, email: true } } },
        });
        return Response.json({ data: card }, { status: 201 });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2002") {
            return Response.json({ error: "Card code already exists" }, { status: 409 });
        }
        if ((err as { code?: string }).code === "P2003") {
            return Response.json({ error: "User not found" }, { status: 422 });
        }
        throw err;
    }
}
