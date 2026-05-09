import "server-only";

import { hash } from "argon2";

import { prisma } from "@/lib/db";

export interface AdminUserRow {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AdminUsersOverview {
    users: AdminUserRow[];
}

export async function getUsersOverview(): Promise<AdminUsersOverview> {
    const users = await prisma.user.findMany({
        where: {
            deletedAt: null,
        },
        take: 20,
        orderBy: {
            createdAt: "desc",
        },
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

    return {
        users: users.map((user) => {
            return {
                id: user.id,
                uuid: user.uuid,
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status,
                createdAt: user.createdAt.toISOString(),
                updatedAt: user.updatedAt.toISOString(),
                deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
            };
        }),
    };
}

export async function createUser(input: {
    name: string;
    email: string;
    password: string;
    role: "SUPER_ADMIN" | "ADMIN" | "USER";
    status: "ACTIVE" | "NOT_VERIFIED" | "DISABLED";
}) {
    const hashedPassword = await hash(input.password);

    return prisma.user.create({
        data: {
            name: input.name,
            email: input.email,
            password: hashedPassword,
            role: input.role,
            status: input.status,
        },
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
}

export async function updateUser(
    id: number,
    input: {
        name: string;
        email: string;
        role: "SUPER_ADMIN" | "ADMIN" | "USER";
        status: "ACTIVE" | "NOT_VERIFIED" | "DISABLED";
    },
) {
    return prisma.user.update({
        where: {
            id,
        },
        data: {
            name: input.name,
            email: input.email,
            role: input.role,
            status: input.status,
        },
    });
}

export async function deleteUser(id: number) {
    return prisma.user.update({
        where: {
            id,
            deletedAt: null,
        },
        data: {
            deletedAt: new Date(),
        },
    });
}
