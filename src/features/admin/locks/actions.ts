"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdminAction } from "@/lib/auth/authorization";

import { mapLockActionError } from "./errors";
import { createLock, softDeleteLock, updateLock } from "./mutations";
import { lockActionCreateSchema, lockActionUpdateSchema } from "./schemas";
import type { LockActionResult } from "./types";

export async function createLockAction(input: unknown): Promise<LockActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = lockActionCreateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await createLock(parsed.data);
    } catch (error) {
        const mapped = mapLockActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/locks");
    return { success: true, message: "Lock created." };
}

export async function updateLockAction(id: number, input: unknown): Promise<LockActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = lockActionUpdateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await updateLock(id, parsed.data);
    } catch (error) {
        const mapped = mapLockActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/locks");
    return { success: true, message: "Lock updated." };
}

export async function deleteLockAction(id: number): Promise<LockActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    try {
        await softDeleteLock(id);
    } catch (error) {
        const mapped = mapLockActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/locks");
    return { success: true, message: "Lock deleted." };
}
