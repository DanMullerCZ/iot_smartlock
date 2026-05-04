import "server-only";

import type { DashboardAccessRequest, DashboardOverviewData } from "@/lib/admin/dashboard-types";
import { prisma } from "@/lib/db";

const RECENT_REQUEST_LIMIT = 6;

function serializeAccessRequest(request: {
    id: bigint;
    requestedAt: Date;
    user: {
        name: string;
        email: string;
    };
    room: {
        name: string;
    };
    card: {
        code: string;
    };
    accessResult: {
        result: "OK" | "GENERIC_ERROR" | "DENIED" | "TIMEOUT";
        completedAt: Date;
    } | null;
}): DashboardAccessRequest {
    return {
        id: request.id.toString(),
        requestedAt: request.requestedAt.toISOString(),
        user: {
            name: request.user.name,
            email: request.user.email,
        },
        room: {
            name: request.room.name,
        },
        card: {
            code: request.card.code,
        },
        accessResult: request.accessResult
            ? {
                  result: request.accessResult.result,
                  completedAt: request.accessResult.completedAt.toISOString(),
              }
            : null,
    };
}

export async function getDashboardOverview(): Promise<DashboardOverviewData> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
        activeUsersCount,
        activeRoomsCount,
        activeCardsCount,
        activePermissionsCount,
        recentDeniedCount,
        recentRequests,
        totalRequests,
    ] = await Promise.all([
        prisma.user.count({
            where: {
                deletedAt: null,
                status: "ACTIVE",
            },
        }),

        prisma.room.count({
            where: {
                deletedAt: null,
                status: "ACTIVE",
            },
        }),

        prisma.accessCard.count({
            where: {
                deletedAt: null,
                status: "ACTIVE",
            },
        }),

        prisma.accessPermission.count({
            where: {
                deletedAt: null,
                status: "ACTIVE",
            },
        }),

        prisma.accessResult.count({
            where: {
                result: "DENIED",
                completedAt: {
                    gte: oneDayAgo,
                },
            },
        }),

        prisma.accessRequest.findMany({
            take: RECENT_REQUEST_LIMIT,
            orderBy: {
                requestedAt: "desc",
            },
            select: {
                id: true,
                requestedAt: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                    },
                },
                room: {
                    select: {
                        name: true,
                    },
                },
                card: {
                    select: {
                        code: true,
                    },
                },
                accessResult: {
                    select: {
                        result: true,
                        completedAt: true,
                    },
                },
            },
        }),

        prisma.accessRequest.count(),
    ]);

    return {
        metrics: [
            {
                label: "Active users",
                value: String(activeUsersCount),
                help: "Verified people with active accounts",
                icon: "users",
            },
            {
                label: "Active rooms",
                value: String(activeRoomsCount),
                help: "Rooms available for access checks",
                icon: "rooms",
            },
            {
                label: "Active cards",
                value: String(activeCardsCount),
                help: "RFID cards currently enabled",
                icon: "cards",
            },
            {
                label: "Active permissions",
                value: String(activePermissionsCount),
                help: "User-room rules currently enabled",
                icon: "permissions",
            },
            {
                label: "Recent denials",
                value: String(recentDeniedCount),
                help: "Denied attempts in the last 24 hours",
                icon: "activity",
            },
        ],
        requests: recentRequests.map(serializeAccessRequest),
        meta: {
            page: 1,
            limit: RECENT_REQUEST_LIMIT,
            total: totalRequests,
            totalPages: Math.ceil(totalRequests / RECENT_REQUEST_LIMIT),
        },
    };
}
