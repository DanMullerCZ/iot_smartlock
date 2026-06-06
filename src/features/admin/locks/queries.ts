import "server-only";

import { prisma } from "@/lib/db";

import type { LockRoomOption, LockRow, LocksOverview } from "./types";

interface PrismaLockRow {
    id: number;
    name: string | null;
    description: string | null;
    roomId: number;
    room: { id: number; name: string; location: string | null };
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
}

interface PrismaLockRoomOption {
    id: number;
    name: string;
    location: string | null;
}

interface ListLocksInput {
    skip: number;
    take: number;
    includeDeleted?: boolean;
    roomId?: number;
}

interface ListLocksResult {
    locks: LockRow[];
    total: number;
}

export const lockSelect = {
    id: true,
    name: true,
    description: true,
    roomId: true,
    room: { select: { id: true, name: true, location: true } },
    createdAt: true,
    updatedAt: true,
    deletedAt: true,
} as const;

export function toLockRow(lock: PrismaLockRow): LockRow {
    return {
        id: lock.id,
        name: lock.name,
        description: lock.description,
        roomId: lock.roomId,
        room: lock.room,
        createdAt: lock.createdAt.toISOString(),
        updatedAt: lock.updatedAt.toISOString(),
        deletedAt: lock.deletedAt ? lock.deletedAt.toISOString() : null,
    };
}

function toLockRoomOption(room: PrismaLockRoomOption): LockRoomOption {
    return {
        id: room.id,
        name: room.name,
        location: room.location,
    };
}

export async function getLockRoomOptions(): Promise<LockRoomOption[]> {
    const rooms = await prisma.room.findMany({
        where: { deletedAt: null },
        orderBy: { name: "asc" },
        select: {
            id: true,
            name: true,
            location: true,
        },
    });

    return rooms.map(toLockRoomOption);
}

export async function getLocksOverview(): Promise<LocksOverview> {
    const [locks, roomOptions] = await Promise.all([
        prisma.lock.findMany({
            where: { deletedAt: null },
            take: 20,
            orderBy: { createdAt: "desc" },
            select: lockSelect,
        }),
        getLockRoomOptions(),
    ]);

    return { locks: locks.map(toLockRow), roomOptions };
}

export async function listLocks({
    skip,
    take,
    includeDeleted = false,
    roomId,
}: ListLocksInput): Promise<ListLocksResult> {
    const where = {
        ...(!includeDeleted && { deletedAt: null }),
        ...(roomId !== undefined && { roomId }),
    };

    const [locks, total] = await Promise.all([
        prisma.lock.findMany({
            where,
            skip,
            take: take,
            orderBy: { createdAt: "desc" },
            select: lockSelect,
        }),
        prisma.lock.count({ where }),
    ]);

    return { locks: locks.map(toLockRow), total };
}

export async function getLockById(id: number): Promise<LockRow | null> {
    const lock = await prisma.lock.findUnique({
        where: { id },
        select: lockSelect,
    });

    return lock ? toLockRow(lock) : null;
}
