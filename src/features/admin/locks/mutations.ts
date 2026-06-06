import "server-only";

import { prisma } from "@/lib/db";
import type { LockCreateInput, LockUpdateInput } from "@/lib/validations/lock";

import { lockSelect, toLockRow } from "./queries";
import type { LockRow } from "./types";

export async function createLock(input: LockCreateInput): Promise<LockRow> {
    const lock = await prisma.lock.create({
        data: input,
        select: lockSelect,
    });

    return toLockRow(lock);
}

export async function updateLock(id: number, input: LockUpdateInput): Promise<LockRow> {
    const lock = await prisma.lock.update({
        where: { id },
        data: input,
        select: lockSelect,
    });

    return toLockRow(lock);
}

export async function softDeleteLock(id: number): Promise<void> {
    await prisma.lock.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });
}
