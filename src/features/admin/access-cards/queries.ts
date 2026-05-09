import "server-only";

import { prisma } from "@/lib/db";

import type { AccessCardRow, AccessCardsOverview, CardStatus, CardType } from "./types";

interface PrismaAccessCardRow {
    id: number;
    uuid: string;
    userId: number | null;
    user: { id: number; name: string; email: string } | null;
    code: string;
    type: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    assignedAt: Date | null;
    deletedAt: Date | null;
}

interface ListAccessCardsInput {
    skip: number;
    take: number;
    includeDeleted?: boolean;
    status?: CardStatus;
    type?: CardType;
    userId?: number;
}

interface ListAccessCardsResult {
    accessCards: AccessCardRow[];
    total: number;
}

export const accessCardSelect = {
    id: true,
    uuid: true,
    userId: true,
    user: { select: { id: true, name: true, email: true } },
    code: true,
    type: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    assignedAt: true,
    deletedAt: true,
} as const;

export function toAccessCardRow(accessCard: PrismaAccessCardRow): AccessCardRow {
    return {
        id: accessCard.id,
        uuid: accessCard.uuid,
        userId: accessCard.userId,
        user: accessCard.user,
        code: accessCard.code,
        type: accessCard.type as CardType,
        status: accessCard.status as CardStatus,
        createdAt: accessCard.createdAt.toISOString(),
        updatedAt: accessCard.updatedAt.toISOString(),
        assignedAt: accessCard.assignedAt ? accessCard.assignedAt.toISOString() : null,
        deletedAt: accessCard.deletedAt ? accessCard.deletedAt.toISOString() : null,
    };
}

export async function getAccessCardsOverview(): Promise<AccessCardsOverview> {
    const accessCards = await prisma.accessCard.findMany({
        where: { deletedAt: null },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: accessCardSelect,
    });

    return { accessCards: accessCards.map(toAccessCardRow) };
}

export async function listAccessCards({
    skip,
    take,
    includeDeleted = false,
    status,
    type,
    userId,
}: ListAccessCardsInput): Promise<ListAccessCardsResult> {
    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(status && { status }),
        ...(type && { type }),
        ...(userId !== undefined && { userId }),
    };

    const [accessCards, total] = await Promise.all([
        prisma.accessCard.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            select: accessCardSelect,
        }),
        prisma.accessCard.count({ where }),
    ]);

    return { accessCards: accessCards.map(toAccessCardRow), total };
}

export async function getAccessCardById(id: number): Promise<AccessCardRow | null> {
    const accessCard = await prisma.accessCard.findUnique({
        where: { id },
        select: accessCardSelect,
    });

    return accessCard ? toAccessCardRow(accessCard) : null;
}
