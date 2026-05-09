import "server-only";

import { prisma } from "@/lib/db";

export type CardType = "RFID";
export type AccessResultValue = "OK" | "GENERIC_ERROR" | "DENIED" | "TIMEOUT";

export interface UserRef {
    id: number;
    name: string;
    email: string;
}

export interface RoomRef {
    id: number;
    name: string;
    location: string | null;
}

export interface CardRef {
    id: number;
    code: string;
    type: CardType;
}

export interface AccessResultEmbedded {
    id: string;
    accessRequestId: string;
    result: AccessResultValue;
    completedAt: string;
}

export interface AdminAccessLogsRequestRow {
    id: string;
    userId: number;
    user: UserRef;
    cardId: number;
    card: CardRef;
    roomId: number;
    room: RoomRef;
    requestedAt: string;
    accessResult: AccessResultEmbedded | null;
}

export interface AdminAccessLogsResultRow {
    id: string;
    accessRequestId: string;
    result: AccessResultValue;
    completedAt: string;
    accessRequest: AdminAccessLogsRequestRow;
}

export interface AdminAccessLogsOverview {
    requests: AdminAccessLogsRequestRow[];
    results: AdminAccessLogsResultRow[];
}

export async function getAccessLogsOverview(): Promise<AdminAccessLogsOverview> {
    const requests = await prisma.accessRequest.findMany({
        select: {
            id: true,
            userId: true,
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
            cardId: true,
            card: {
                select: {
                    id: true,
                    code: true,
                    type: true,
                },
            },
            roomId: true,
            room: {
                select: {
                    id: true,
                    name: true,
                    location: true,
                },
            },
            requestedAt: true,
            accessResult: {
                select: {
                    id: true,
                    accessRequestId: true,
                    result: true,
                    completedAt: true,
                },
            },
        },
        orderBy: {
            requestedAt: "desc",
        },
    });

    const results = await prisma.accessResult.findMany({
        select: {
            id: true,
            accessRequestId: true,
            result: true,
            completedAt: true,
            accessRequest: {
                select: {
                    id: true,
                    userId: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    cardId: true,
                    card: {
                        select: {
                            id: true,
                            code: true,
                            type: true,
                        },
                    },
                    roomId: true,
                    room: {
                        select: {
                            id: true,
                            name: true,
                            location: true,
                        },
                    },
                    requestedAt: true,
                    accessResult: {
                        select: {
                            id: true,
                            accessRequestId: true,
                            result: true,
                            completedAt: true,
                        },
                    },
                },
            },
        },
        orderBy: {
            completedAt: "desc",
        },
    });

    return {
        requests: requests.map((request) => {
            const accessResult = request.accessResult;

            return {
                id: String(request.id),
                userId: request.userId,
                user: request.user,
                cardId: request.cardId,
                card: request.card,
                roomId: request.roomId,
                room: request.room,
                requestedAt: request.requestedAt.toISOString(),
                accessResult: accessResult
                    ? {
                          id: String(accessResult.id),
                          accessRequestId: String(accessResult.accessRequestId),
                          result: accessResult.result,
                          completedAt: accessResult.completedAt.toISOString(),
                      }
                    : null,
            };
        }),

        results: results.map((result) => {
            const accessRequest = result.accessRequest;
            const accessResult = accessRequest.accessResult;

            return {
                id: String(result.id),
                accessRequestId: String(result.accessRequestId),
                result: result.result,
                completedAt: result.completedAt.toISOString(),
                accessRequest: {
                    id: String(accessRequest.id),
                    userId: accessRequest.userId,
                    user: accessRequest.user,
                    cardId: accessRequest.cardId,
                    card: accessRequest.card,
                    roomId: accessRequest.roomId,
                    room: accessRequest.room,
                    requestedAt: accessRequest.requestedAt.toISOString(),
                    accessResult: accessResult
                        ? {
                              id: String(accessResult.id),
                              accessRequestId: String(accessResult.accessRequestId),
                              result: accessResult.result,
                              completedAt: accessResult.completedAt.toISOString(),
                          }
                        : null,
                },
            };
        }),
    };
}
