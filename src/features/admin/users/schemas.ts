import { z } from "zod";

import { USER_ROLES, USER_STATUSES } from "./constants";

export const userCreateSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
    password: z.string().min(8).max(64),
    role: z.enum(USER_ROLES).default("USER"),
    status: z.enum(USER_STATUSES).default("NOT_VERIFIED"),
});

export const userPatchSchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        email: z.email().optional(),
        role: z.enum(USER_ROLES).optional(),
        status: z.enum(USER_STATUSES).optional(),
    })
    .strict();

export const userActionUpdateSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.email("Invalid email"),
    role: z.enum(USER_ROLES, { message: "Invalid role" }),
    status: z.enum(USER_STATUSES, { message: "Invalid status" }),
});

export const userActionCreateSchema = userActionUpdateSchema.extend({
    password: z.string().min(8, "Password must be at least 8 characters").max(64),
});

export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserPatchInput = z.infer<typeof userPatchSchema>;
export type UserActionCreateInput = z.infer<typeof userActionCreateSchema>;
export type UserActionUpdateInput = z.infer<typeof userActionUpdateSchema>;
