import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    const requestedAt = new Date();

    let body: unknown;
    try {
        body = await req.json();
    } catch {
        return Response.json({ error: "Invalid JSON" }, { status: 400 });
    }

    let parsedBody: { lockId: number; roomId: number; code: string };
    try {
        parsedBody = parseAccessBody(body);
    } catch (error: unknown) {
        return Response.json(
            { error: error instanceof Error ? error.message : "Invalid Input" },
            { status: 422 },
        );
    }

    type CheckResult =
        | { granted: true; userId: number; cardId: number }
        | { granted: false; userId?: number; cardId?: number; status: number; error: string };

    let checkResult: CheckResult | undefined;
    try {
        checkResult = await prisma.$transaction(async (tx) => {
            const room = await tx.room.findUnique({
                where: { id: parsedBody.roomId, status: "ACTIVE" },
            });
            if (!room) {
                return {
                    granted: false,
                    status: 404,
                    error: `Room (${parsedBody.roomId.toString()}) not found`,
                } as const;
            }

            const card = await tx.accessCard.findUnique({
                where: { code: parsedBody.code, status: "ACTIVE", type: "RFID" },
            });
            if (!card) {
                return { granted: false, status: 404, error: "No active card found" } as const;
            }
            if (card.userId === null) {
                return {
                    granted: false,
                    cardId: card.id,
                    status: 400,
                    error: "Card is not assigned to anyone",
                } as const;
            }

            const user = await tx.user.findUnique({ where: { id: card.userId } });
            if (!user) {
                return {
                    granted: false,
                    cardId: card.id,
                    status: 404,
                    error: "No user assigned to card",
                } as const;
            }
            if (user.status !== "ACTIVE") {
                return {
                    granted: false,
                    userId: user.id,
                    cardId: card.id,
                    status: 403,
                    error: "User is not active",
                } as const;
            }

            const accessPermissions = await tx.accessPermission.findMany({
                where: { roomId: parsedBody.roomId, userId: user.id },
            });
            if (accessPermissions.length === 0) {
                return {
                    granted: false,
                    userId: user.id,
                    cardId: card.id,
                    status: 403,
                    error: "User is not permitted to access",
                } as const;
            }

            const activePermissions = accessPermissions.filter((ap) => {
                return ap.status === "ACTIVE";
            });
            if (activePermissions.length === 0) {
                return {
                    granted: false,
                    userId: user.id,
                    cardId: card.id,
                    status: 403,
                    error: "User has no active permissions",
                } as const;
            }

            const validPermission = activePermissions.find((ap) => {
                return (
                    (ap.from === null || requestedAt >= ap.from) &&
                    (ap.to === null || requestedAt <= ap.to)
                );
            });
            if (!validPermission) {
                return {
                    granted: false,
                    userId: user.id,
                    cardId: card.id,
                    status: 403,
                    error: "No valid permission for current time",
                } as const;
            }

            return { granted: true, userId: user.id, cardId: card.id } as const;
        });
    } catch {
        try {
            if (checkResult?.userId !== undefined && checkResult.cardId !== undefined) {
                const accessRequestLog = await prisma.accessRequest.create({
                    data: {
                        roomId: parsedBody.roomId,
                        userId: checkResult.userId,
                        cardId: checkResult.cardId,
                        lockId: parsedBody.lockId,
                        requestedAt,
                    },
                });

                await prisma.accessResult.create({
                    data: {
                        accessRequestId: accessRequestLog.id,
                        completedAt: new Date(),
                        result: "GENERIC_ERROR",
                    },
                });
            }
        } catch {}

        return Response.json({ error: "Internal server error" }, { status: 500 });
    }

    // Logged outside the transaction so denied attempts are persisted too.
    // Only possible once we've identified both card and user.
    if (checkResult.userId !== undefined && checkResult.cardId !== undefined) {
        const accessRequestLog = await prisma.accessRequest.create({
            data: {
                roomId: parsedBody.roomId,
                userId: checkResult.userId,
                cardId: checkResult.cardId,
                lockId: parsedBody.lockId,
                requestedAt,
            },
        });

        await prisma.accessResult.create({
            data: {
                accessRequestId: accessRequestLog.id,
                completedAt: new Date(),
                result: checkResult.granted ? "OK" : "DENIED",
            },
        });
    }

    if (!checkResult.granted) {
        return Response.json({ error: checkResult.error }, { status: checkResult.status });
    }

    return Response.json({ access: true });
}

function parseAccessBody(body: unknown): {
    lockId: number;
    roomId: number;
    code: string;
} {
    if (typeof body !== "object" || body === null) {
        throw new Error("Request body must be a non-null object");
    }

    const b = body as Record<string, unknown>;

    if (typeof b.lockId !== "number" || !Number.isInteger(b.lockId)) {
        throw new Error("Missing or invalid 'lockId': expected integer");
    }
    if (typeof b.roomId !== "number" || !Number.isInteger(b.roomId)) {
        throw new Error("Missing or invalid 'roomId': expected integer");
    }
    if (typeof b.code !== "string" || b.code.trim() === "") {
        throw new Error("Missing or invalid 'code': expected non-empty string");
    }

    return {
        lockId: b.lockId,
        roomId: b.roomId,
        code: b.code,
    };
}
