"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdminAction } from "@/lib/auth/authorization";

import { mapUserActionError } from "./errors";
import { createUser, softDeleteUser, updateUser } from "./mutations";
import { userActionCreateSchema, userActionUpdateSchema } from "./schemas";
import type { UserActionResult } from "./types";

export async function createUserAction(input: unknown): Promise<UserActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) return authFailure;

    const parsed = userActionCreateSchema.safeParse(input);
    if (!parsed.success)
        return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };

    try {
        await createUser(parsed.data);
    } catch (error) {
        const mapped = mapUserActionError(error);
        if (mapped) return mapped;
        throw error;
    }

    revalidatePath("/users");
    return { success: true, message: "User created." };
}

export async function updateUserAction(id: number, input: unknown): Promise<UserActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) return authFailure;

    const parsed = userActionUpdateSchema.safeParse(input);
    if (!parsed.success)
        return { success: false, message: parsed.error.issues[0]?.message ?? "Invalid input" };

    try {
        await updateUser(id, parsed.data);
    } catch (error) {
        const mapped = mapUserActionError(error);
        if (mapped) return mapped;
        throw error;
    }

    revalidatePath("/users");
    return { success: true, message: "User updated." };
}

export async function deleteUserAction(id: number): Promise<UserActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) return authFailure;

    try {
        await softDeleteUser(id);
    } catch (error) {
        const mapped = mapUserActionError(error);
        if (mapped) return mapped;
        throw error;
    }

    revalidatePath("/users");
    return { success: true, message: "User deleted." };
}
