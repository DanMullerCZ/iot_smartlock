import "server-only";

import { prisma } from "@/lib/db";

import { accessCardSelect, toAccessCardRow } from "./queries";
import type { AccessCardCreateInput, AccessCardPatchInput } from "./schemas";
import type { AccessCardRow } from "./types";

export async function createAccessCard(input: AccessCardCreateInput): Promise<AccessCardRow> {
    const accessCard = await prisma.accessCard.create({
        data: input,
        select: accessCardSelect,
    });

    return toAccessCardRow(accessCard);
}

export async function updateAccessCard(
    id: number,
    input: AccessCardPatchInput,
): Promise<AccessCardRow> {
    const accessCard = await prisma.accessCard.update({
        where: { id },
        data: input,
        select: accessCardSelect,
    });

    return toAccessCardRow(accessCard);
}

export async function softDeleteAccessCard(id: number): Promise<void> {
    await prisma.accessCard.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });
}
