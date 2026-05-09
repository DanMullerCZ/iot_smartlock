import "server-only";

import { prisma } from "@/lib/db";

export interface AdminPermissionRow {
    id: number;
    userId: number;
    roomId: number;
    status: string;
    from: string | null;
    to: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AdminPermissionsOverview {
    accessPermissions: AdminPermissionRow[];
}

export async function getPermissionsOverview(): Promise<AdminPermissionsOverview> {
    const accessPermissions = await prisma.accessPermission.findMany({
        where: {
            deletedAt: null,
        },
        take: 20,
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            userId: true,
            roomId: true,
            status: true,
            from: true,
            to: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
        },
    });

    return {
        accessPermissions: accessPermissions.map((accessPermission) => {
            return {
                id: accessPermission.id,
                userId: accessPermission.userId,
                roomId: accessPermission.roomId,
                status: accessPermission.status,
                from: accessPermission.from ? accessPermission.from.toISOString() : null,
                to: accessPermission.to ? accessPermission.to.toISOString() : null,
                createdAt: accessPermission.createdAt.toISOString(),
                updatedAt: accessPermission.updatedAt.toISOString(),
                deletedAt: accessPermission.deletedAt
                    ? accessPermission.deletedAt.toISOString()
                    : null,
            };
        }),
    };
}
