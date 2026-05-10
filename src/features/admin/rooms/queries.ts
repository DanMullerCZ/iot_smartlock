import "server-only";

import { prisma } from "@/lib/db";

import type { RoomRow, RoomsOverview, RoomStatus } from "./types";

interface PrismaRoomRow {
    id: number;
    uuid: string;
    name: string;
    location: string | null;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

interface ListRoomsInput {
    skip: number;
    take: number;
    includeDeleted?: boolean;
    status?: RoomStatus;
}

interface ListRoomsResult {
    rooms: RoomRow[];
    total: number;
}

export const roomSelect = {
    id: true,
    uuid: true,
    name: true,
    location: true,
    description: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const;

export function toRoomRow(room: PrismaRoomRow): RoomRow {
    return {
        id: room.id,
        uuid: room.uuid,
        name: room.name,
        location: room.location,
        description: room.description,
        status: room.status as RoomStatus,
        createdAt: room.createdAt.toISOString(),
        updatedAt: room.updatedAt.toISOString(),
        deletedAt: room.deletedAt ? room.deletedAt.toISOString() : null,
    };
}

export async function getRoomsOverview(): Promise<RoomsOverview> {
    const rooms = await prisma.room.findMany({
        where: { deletedAt: null },
        take: 20,
        orderBy: { createdAt: "desc" },
        select: roomSelect,
    });

    return { rooms: rooms.map(toRoomRow) };
}

export async function listRooms({
    skip,
    take,
    includeDeleted = false,
    status,
}: ListRoomsInput): Promise<ListRoomsResult> {
    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(status && { status }),
    };

    const [rooms, total] = await Promise.all([
        prisma.room.findMany({
            where,
            skip,
            take,
            orderBy: { createdAt: "desc" },
            select: roomSelect,
        }),
        prisma.room.count({ where }),
    ]);

    return { rooms: rooms.map(toRoomRow), total };
}

export async function getRoomById(id: number): Promise<RoomRow | null> {
    const room = await prisma.room.findUnique({
        where: { id },
        select: roomSelect,
    });

    return room ? toRoomRow(room) : null;
}
