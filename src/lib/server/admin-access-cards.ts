import "server-only";

import { prisma } from "@/lib/db";

export interface AdminAccessCardRow {
    id: number;
    uuid: string;
    userId: number | null;
    code: string;
    type: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    assignedAt: string | null;
    deletedAt: string | null;
}

export interface AdminAccessCardsOverview {
    accessCards: AdminAccessCardRow[];
}

export async function getAccessCardsOverview(): Promise<AdminAccessCardsOverview> {
    const accessCards = await prisma.accessCard.findMany({
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
            userId: true,
            code: true,
            type: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            assignedAt: true,
            deletedAt: true,
        },
    });

    return {
        accessCards: accessCards.map((accessCard) => {
            return {
                id: accessCard.id,
                uuid: accessCard.uuid,
                userId: accessCard.userId,
                code: accessCard.code,
                type: accessCard.type,
                status: accessCard.status,
                createdAt: accessCard.createdAt.toISOString(),
                updatedAt: accessCard.updatedAt.toISOString(),
                assignedAt: accessCard.assignedAt ? accessCard.assignedAt.toISOString() : null,
                deletedAt: accessCard.deletedAt ? accessCard.deletedAt.toISOString() : null,
            };
        }),
    };
}
