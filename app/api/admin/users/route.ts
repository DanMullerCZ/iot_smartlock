import argon2 from "argon2";
import type { NextRequest } from "next/server";
import z from "zod";

import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { prisma } from "@/lib/db";
import { adminUserCreateSchema } from "@/lib/validations/user";

export async function GET(req: NextRequest) {
    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);

    const includeDeleted = sp.get("includeDeleted") === "true";
    const role = sp.get("role") ?? undefined;
    const status = sp.get("status") ?? undefined;

    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(role && { role: role as never }),
        ...(status && { status: status as never }),
    };

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
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
        }),
        prisma.user.count({ where }),
    ]);

    return Response.json({ data: users, meta: paginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = adminUserCreateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    const { password, ...rest } = parsed.data;
    const hashedPassword = await argon2.hash(password);

    try {
        const user = await prisma.user.create({
            data: { ...rest, password: hashedPassword },
            select: {
                id: true,
                uuid: true,
                name: true,
                email: true,
                role: true,
                status: true,
                createdAt: true,
            },
        });
        return Response.json({ data: user }, { status: 201 });
    } catch (err: unknown) {
        if ((err as { code?: string }).code === "P2002") {
            return Response.json({ error: "Email already in use" }, { status: 409 });
        }
        throw err;
    }
}
