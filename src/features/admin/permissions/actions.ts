"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdminAction } from "@/lib/auth/authorization";

import { mapPermissionActionError } from "./errors";
import {
    createAccessPermission,
    softDeleteAccessPermission,
    updateAccessPermission,
} from "./mutations";
import { accessPermissionActionCreateSchema, accessPermissionActionUpdateSchema } from "./schemas";
import type { PermissionActionResult } from "./types";

export async function createPermissionAction(input: unknown): Promise<PermissionActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = accessPermissionActionCreateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await createAccessPermission(parsed.data);
    } catch (error) {
        const mapped = mapPermissionActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/permissions");
    return { success: true, message: "Permission created." };
}

export async function updatePermissionAction(
    id: number,
    input: unknown,
): Promise<PermissionActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = accessPermissionActionUpdateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await updateAccessPermission(id, parsed.data);
    } catch (error) {
        const mapped = mapPermissionActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/permissions");
    return { success: true, message: "Permission updated." };
}

export async function deletePermissionAction(id: number): Promise<PermissionActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    try {
        await softDeleteAccessPermission(id);
    } catch (error) {
        const mapped = mapPermissionActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/permissions");
    return { success: true, message: "Permission deleted." };
}
