import type { NextRequest } from "next/server";
import z from "zod";

import { mapLockRouteError } from "@/features/admin/locks/errors";
import { createLock } from "@/features/admin/locks/mutations";
import { listLocks } from "@/features/admin/locks/queries";
import { parsePagination, paginationMeta } from "@/lib/api/pagination";
import { requireSuperAdminApi } from "@/lib/auth/authorization";
import { lockCreateSchema } from "@/lib/validations/lock";

export async function GET(req: NextRequest) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    const sp = req.nextUrl.searchParams;
    const { page, limit, skip } = parsePagination(sp);
    const includeDeleted = sp.get("includeDeleted") === "true";
    const roomId = sp.get("roomId") ? parseInt(sp.get("roomId") ?? "", 10) : undefined;

    const { locks, total } = await listLocks({
        skip,
        take: limit,
        includeDeleted,
        ...(roomId !== undefined && !isNaN(roomId) && { roomId }),
    });

    return Response.json({ data: locks, meta: paginationMeta(total, page, limit) });
}

export async function POST(req: NextRequest) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = lockCreateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const lock = await createLock(parsed.data);
        return Response.json({ data: lock }, { status: 201 });
    } catch (err: unknown) {
        const mapped = mapLockRouteError(err);
        if (mapped) {
            return mapped;
        }

        throw err;
    }
}
