"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createUser, updateUser, deleteUser } from "@/lib/server/admin-users";

const userRoles = ["SUPER_ADMIN", "ADMIN", "USER"] as const;
const userStatuses = ["NOT_VERIFIED", "ACTIVE", "DISABLED"] as const;

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().includes("@"),
    role: z.enum(userRoles, {
        message: "Invalid role",
    }),
    status: z.enum(userStatuses, {
        message: "Invalid status",
    }),
});
export async function createUserAction(input: unknown) {
    const parsed = userSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    await createUser(parsed.data);

    revalidatePath("/users");

    return {
        success: true,
        message: "User created.",
    };
}

export async function updateUserAction(id: number, input: unknown) {
    const parsed = userSchema.safeParse(input);

    if (!parsed.success) {
        return {
            success: false,
            message: parsed.error.issues[0]?.message ?? "Invalid input",
        };
    }

    await updateUser(id, parsed.data);

    revalidatePath("/users");

    return {
        success: true,
        message: "User updated.",
    };
}

export async function deleteUserAction(id: number) {
    await deleteUser(id, "soft");

    revalidatePath("/users");

    return {
        success: true,
        message: "User deleted.",
    };
}
