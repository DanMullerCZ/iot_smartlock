"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { Prisma } from "@/base/generated/prisma/client";
import { requireSuperAdminAction } from "@/lib/auth/authorization";
import { createUser, updateUser, deleteUser } from "@/lib/server/admin-users";

const userRoles = ["SUPER_ADMIN", "ADMIN", "USER"] as const;
const userStatuses = ["NOT_VERIFIED", "ACTIVE", "DISABLED"] as const;

interface UserActionResult {
    success: boolean;
    message: string;
}

const userBaseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    role: z.enum(userRoles, {
        message: "Invalid role",
    }),
    status: z.enum(userStatuses, {
        message: "Invalid status",
    }),
});

const userCreateSchema = userBaseSchema.extend({
    password: z.string().min(8, "Password must be at least 8 characters").max(64),
});

const userUpdateSchema = userBaseSchema;

function mapPrismaError(error: unknown): UserActionResult | null {
    if (!(error instanceof Prisma.PrismaClientKnownRequestError)) {
        return null;
    }

    if (error.code === "P2002") {
        return {
            success: false,
            message: "Email already in use.",
        };
    }

    if (error.code === "P2025") {
        return {
            success: false,
            message: "User not found.",
        };
    }

    return null;
}

export async function createUserAction(input: unknown): Promise<UserActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = userCreateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await createUser(parsed.data);
    } catch (error) {
        const actionError = mapPrismaError(error);

        if (actionError) {
            return actionError;
        }

        throw error;
    }

    revalidatePath("/users");

    return {
        success: true,
        message: "User created.",
    };
}

export async function updateUserAction(id: number, input: unknown): Promise<UserActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    const parsed = userUpdateSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    try {
        await updateUser(id, parsed.data);
    } catch (error) {
        const actionError = mapPrismaError(error);

        if (actionError) {
            return actionError;
        }

        throw error;
    }

    revalidatePath("/users");

    return {
        success: true,
        message: "User updated.",
    };
}

export async function deleteUserAction(id: number): Promise<UserActionResult> {
    const authFailure = await requireSuperAdminAction();
    if (authFailure) {
        return authFailure;
    }

    try {
        await deleteUser(id);
    } catch (error) {
        const actionError = mapPrismaError(error);

        if (actionError) {
            return actionError;
        }

        throw error;
    }

    revalidatePath("/users");

    return {
        success: true,
        message: "User deleted.",
    };
}
