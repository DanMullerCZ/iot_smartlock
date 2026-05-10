"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdminAction } from "@/lib/auth/authorization";

import { mapRoomActionError } from "./errors";
import { createRoom, softDeleteRoom, updateRoom } from "./mutations";
import { roomActionCreateSchema, roomActionUpdateSchema } from "./schemas";
import type { RoomActionResult } from "./types";

export async function createRoomAction(input: unknown): Promise<RoomActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = roomActionCreateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await createRoom(parsed.data);
    } catch (error) {
        const mapped = mapRoomActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/rooms");
    return { success: true, message: "Room created." };
}

export async function updateRoomAction(id: number, input: unknown): Promise<RoomActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = roomActionUpdateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await updateRoom(id, parsed.data);
    } catch (error) {
        const mapped = mapRoomActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/rooms");
    return { success: true, message: "Room updated." };
}

export async function deleteRoomAction(id: number): Promise<RoomActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    try {
        await softDeleteRoom(id);
    } catch (error) {
        const mapped = mapRoomActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/rooms");
    return { success: true, message: "Room deleted." };
}
