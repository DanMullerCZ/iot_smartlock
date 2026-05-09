import "server-only";

import { prisma } from "@/lib/db";

import type { AccessPermissionRow, PermissionStatus, PermissionsOverview } from "./types";

interface PrismaAccessPermissionRow {
    id: number;
    userId: number;
    user: { id: number; name: string; email: string };
    roomId: number;
    room: { id: number; name: string; location: string | null };
    status: string;
    from: Date | null;
    to: Date | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

interface ListPermissionsInput {
    skip: number;
    take: number;
    includeDeleted?: boolean;
    status?: PermissionStatus;
    userId?: number;
    roomId?: number;
}

interface ListPermissionsResult {
    accessPermissions: AccessPermissionRow[];
    total: number;
}

export const accessPermissionSelect = {
    id: true,
    userId: true,
    user: { select: { id: true, name: true, email: true } },
    roomId: true,
    room: { select: { id: true, name: true, location: true } },
    status: true,
    from: true,
    to: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const;

export function toAccessPermissionRow(permission: PrismaAccessPermissionRow): AccessPermissionRow {
    return {
        id: permission.id,
        userId: permission.userId,
        user: permission.user,
        roomId: permission.roomId,
        room: permission.room,
        status: permission.status as PermissionStatus,
        from: permission.from ? permission.from.toISOString() : null,
        to: permission.to ? permission.to.toISOString() : null,
        createdAt: permission.createdAt.toISOString(),
        updatedAt: permission.updatedAt.toISOString(),
        deletedAt: permission.deletedAt ? permission.deletedAt.toISOString() : null,
    };
}

export async function getPermissionsOverview(): Promise<PermissionsOverview> {
    const accessPermissions = await prisma.accessPermission.findMany({
        where: { deletedAt: null },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: accessPermissionSelect,
    });

    return { accessPermissions: accessPermissions.map(toAccessPermissionRow) };
}

export async function listAccessPermissions({
    skip,
    take,
    includeDeleted = false,
    status,
    userId,
    roomId,
}: ListPermissionsInput): Promise<ListPermissionsResult> {
    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(status && { status }),
        ...(userId !== undefined && { userId }),
        ...(roomId !== undefined && { roomId }),
    };

    const [accessPermissions, total] = await Promise.all([
        prisma.accessPermission.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            select: accessPermissionSelect,
        }),
        prisma.accessPermission.count({ where }),
    ]);

    return {
        accessPermissions: accessPermissions.map(toAccessPermissionRow),
        total,
    };
}

export async function getAccessPermissionById(id: number): Promise<AccessPermissionRow | null> {
    const permission = await prisma.accessPermission.findUnique({
        where: { id },
        select: accessPermissionSelect,
    });

    return permission ? toAccessPermissionRow(permission) : null;
}
