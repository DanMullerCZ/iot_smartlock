import type { NextRequest } from "next/server";
import z from "zod";

import { mapLockRouteError } from "@/features/admin/locks/errors";
import { softDeleteLock, updateLock } from "@/features/admin/locks/mutations";
import { getLockById } from "@/features/admin/locks/queries";
import { requireSuperAdminApi } from "@/lib/auth/authorization";
import { lockUpdateSchema } from "@/lib/validations/lock";

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

    const lock = await getLockById(lockId);
    if (!lock) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return Response.json({ data: lock });
}

export async function PATCH(req: NextRequest, { params }: Params) {
    const authResponse = await requireSuperAdminApi(req);
    if (authResponse) {
        return authResponse;
    }

    const { id } = await params;
    const lockId = parseId(id);
    if (lockId === null) {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = lockUpdateSchema.safeParse(body);
    if (!parsed.success) {
        return Response.json({ error: z.treeifyError(parsed.error) }, { status: 422 });
    }

    try {
        const lock = await updateLock(lockId, parsed.data);
        return Response.json({ data: lock });
    } catch (err: unknown) {
        const mapped = mapLockRouteError(err);
        if (mapped) {
            return mapped;
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
        await softDeleteLock(lockId);
        return new Response(null, { status: 204 });
    } catch (err: unknown) {
        const mapped = mapLockRouteError(err);
        if (mapped) {
            return mapped;
        }

        throw err;
    }
}
