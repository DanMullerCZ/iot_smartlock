import "server-only";

import { prisma } from "@/lib/db";

export interface AdminRoomRow {
    id: number;
    uuid: string;
    name: string;
    location: string | null;
    description: string | null;
    status: string;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AdminRoomsOverview {
    rooms: AdminRoomRow[];
}

export async function getRoomsOverview(): Promise<AdminRoomsOverview> {
    const rooms = await prisma.room.findMany({
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
            location: true,
            description: true,
            status: true,
            createdAt: true,
            updatedAt: true,
            deletedAt: true,
        },
    });

    return {
        rooms: rooms.map((room) => {
            return {
                id: room.id,
                uuid: room.uuid,
                name: room.name,
                location: room.location,
                description: room.description,
                status: room.status,
                createdAt: room.createdAt.toISOString(),
                updatedAt: room.updatedAt.toISOString(),
                deletedAt: room.deletedAt ? room.deletedAt.toISOString() : null,
            };
        }),
    };
}
