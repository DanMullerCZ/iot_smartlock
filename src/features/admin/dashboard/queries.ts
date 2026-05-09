import "server-only";

import { prisma } from "@/lib/db";

import { DASHBOARD_METRIC_META, RECENT_REQUEST_LIMIT } from "./constants";
import type { AccessResultValue, DashboardAccessRequest, DashboardOverviewData } from "./types";

function toDashboardAccessRequest(request: {
    id: bigint;
    requestedAt: Date;
    user: { name: string; email: string };
    room: { name: string };
    card: { code: string };
    accessResult: { result: string; completedAt: Date } | null;
}): DashboardAccessRequest {
    return {
        id: request.id.toString(),
        requestedAt: request.requestedAt.toISOString(),
        user: request.user,
        room: request.room,
        card: request.card,
        accessResult: request.accessResult
            ? {
                  result: request.accessResult.result as AccessResultValue,
                  completedAt: request.accessResult.completedAt.toISOString(),
              }
            : null,
    };
}

export async function getDashboardOverview(): Promise<DashboardOverviewData> {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [
        activeUsers,
        activeRooms,
        activeCards,
        activePermissions,
        recentDenials,
        recentRequests,
        totalRequests,
    ] = await Promise.all([
        prisma.user.count({ where: { deletedAt: null, status: "ACTIVE" } }),
        prisma.room.count({ where: { deletedAt: null, status: "ACTIVE" } }),
        prisma.accessCard.count({ where: { deletedAt: null, status: "ACTIVE" } }),
        prisma.accessPermission.count({ where: { deletedAt: null, status: "ACTIVE" } }),
        prisma.accessResult.count({
            where: { result: "DENIED", completedAt: { gte: oneDayAgo } },
        }),
        prisma.accessRequest.findMany({
            take: RECENT_REQUEST_LIMIT,
            orderBy: { requestedAt: "desc" },
            select: {
                id: true,
                requestedAt: true,
                user: { select: { name: true, email: true } },
                room: { select: { name: true } },
                card: { select: { code: true } },
                accessResult: { select: { result: true, completedAt: true } },
            },
        }),
        prisma.accessRequest.count(),
    ]);

    return {
        metrics: [
            { ...DASHBOARD_METRIC_META.activeUsers, value: String(activeUsers) },
            { ...DASHBOARD_METRIC_META.activeRooms, value: String(activeRooms) },
            { ...DASHBOARD_METRIC_META.activeCards, value: String(activeCards) },
            { ...DASHBOARD_METRIC_META.activePermissions, value: String(activePermissions) },
            { ...DASHBOARD_METRIC_META.recentDenials, value: String(recentDenials) },
        ],
        requests: recentRequests.map(toDashboardAccessRequest),
        meta: {
            page: 1,
            limit: RECENT_REQUEST_LIMIT,
            total: totalRequests,
            totalPages: Math.ceil(totalRequests / RECENT_REQUEST_LIMIT),
        },
    };
}
