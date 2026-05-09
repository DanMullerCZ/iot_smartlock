"use server";

import { revalidatePath } from "next/cache";

import { requireSuperAdminAction } from "@/lib/auth/authorization";

import { mapAccessCardActionError } from "./errors";
import { createAccessCard, softDeleteAccessCard, updateAccessCard } from "./mutations";
import { accessCardActionCreateSchema, accessCardActionUpdateSchema } from "./schemas";
import type { AccessCardActionResult } from "./types";

export async function createAccessCardAction(input: unknown): Promise<AccessCardActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = accessCardActionCreateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await createAccessCard(parsed.data);
    } catch (error) {
        const mapped = mapAccessCardActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/access-cards");
    return { success: true, message: "Access card created." };
}

export async function updateAccessCardAction(
    id: number,
    input: unknown,
): Promise<AccessCardActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = accessCardActionUpdateSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await updateAccessCard(id, parsed.data);
    } catch (error) {
        const mapped = mapAccessCardActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/access-cards");
    return { success: true, message: "Access card updated." };
}

export async function deleteAccessCardAction(id: number): Promise<AccessCardActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    try {
        await softDeleteAccessCard(id);
    } catch (error) {
        const mapped = mapAccessCardActionError(error);
        if (mapped) {
            return mapped;
        }

        throw error;
    }

    revalidatePath("/access-cards");
    return { success: true, message: "Access card deleted." };
}
