import "server-only";

import { prisma } from "@/lib/db";

import { roomSelect, toRoomRow } from "./queries";
import type { RoomCreateInput, RoomPatchInput } from "./schemas";
import type { RoomRow } from "./types";

export async function createRoom(input: RoomCreateInput): Promise<RoomRow> {
    const room = await prisma.room.create({
        data: input,
        select: roomSelect,
    });

    return toRoomRow(room);
}

export async function updateRoom(id: number, input: RoomPatchInput): Promise<RoomRow> {
    const room = await prisma.room.update({
        where: { id },
        data: input,
        select: roomSelect,
    });

    return toRoomRow(room);
}

export async function softDeleteRoom(id: number): Promise<void> {
    await prisma.room.update({
        where: { id, deletedAt: null },
        data: { deletedAt: new Date() },
    });
}
