import "server-only";

import { prisma } from "@/lib/db";

import type { UserRow, UsersOverview, UserRole, UserStatus } from "./types";

function toUserRow(user: {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}): UserRow {
    return {
        id: user.id,
        uuid: user.uuid,
        name: user.name,
        email: user.email,
        role: user.role as UserRole,
        status: user.status as UserStatus,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        deletedAt: user.deletedAt?.toISOString() ?? null,
    };
}

export async function getUsersOverview(): Promise<UsersOverview> {
    const users = await prisma.user.findMany({
        where: { deletedAt: null },
        take: 20,
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
    });

    return { users: users.map(toUserRow) };
}

export async function getUserById(id: number): Promise<UserRow | null> {
    const user = await prisma.user.findUnique({
        where: { id },
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
    });

    return user ? toUserRow(user) : null;
}
