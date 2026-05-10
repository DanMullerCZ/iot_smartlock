import { hash } from "argon2";

import { prisma } from "@/lib/db";

export async function createUser(email: string, password: string, name: string) {
    const hashedPassword = await hash(password);
    return prisma.user.create({
        data: { email, name, password: hashedPassword },
        select: {
            uuid: true,
            email: true,
            name: true,
            role: true,
            status: true,
            createdAt: true,
        },
    });
}
