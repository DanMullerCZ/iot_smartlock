import "server-only";

import { hash } from "argon2";

import { prisma } from "@/lib/db";

import type { UserCreateInput, UserPatchInput } from "./schemas";

export async function createUser(input: UserCreateInput) {
    const { password, ...data } = input;
    const hashedPassword = await hash(password);

    return prisma.user.create({
        data: { ...data, password: hashedPassword },
        select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
}

export async function updateUser(id: number, input: UserPatchInput) {
    return prisma.user.update({
        where: { id },
        data: input,
        select: {
            id: true,
            uuid: true,
            name: true,
            email: true,
            role: true,
            status: true,
            updatedAt: true,
        },
    });
}

export async function softDeleteUser(id: number) {
    return prisma.user.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });
}
