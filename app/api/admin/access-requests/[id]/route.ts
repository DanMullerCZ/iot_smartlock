import type { NextRequest } from "next/server";

import { jsonBigInt } from "@/lib/api/bigint";
import { prisma } from "@/lib/db";

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
    const { id } = await params;
    let bigId: bigint;
    try {
        bigId = BigInt(id);
    } catch {
        return Response.json({ error: "Invalid id" }, { status: 400 });
    }

    const request = await prisma.accessRequest.findUnique({
        where: { id: bigId },
        include: {
            user: { select: { id: true, name: true, email: true } },
            card: { select: { id: true, code: true, type: true } },
            room: { select: { id: true, name: true, location: true } },
            accessResult: true,
        },
    });

    if (!request) {
        return Response.json({ error: "Not found" }, { status: 404 });
    }

    return jsonBigInt({ data: request });
}
