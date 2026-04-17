import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
    password: z.string().min(8).max(64),
});

export const adminUserCreateSchema = z.object({
    name: z.string().min(1).max(100),
    email: z.email(),
    password: z.string().min(8).max(64),
    role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).default("USER"),
    status: z.enum(["NOT_VERIFIED", "ACTIVE", "DISABLED"]).default("NOT_VERIFIED"),
});

export const adminUserUpdateSchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        email: z.email().optional(),
        role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
        status: z.enum(["NOT_VERIFIED", "ACTIVE", "DISABLED"]).optional(),
    })
    .strict();

export type RegisterInput = z.infer<typeof registerSchema>;
export type AdminUserCreateInput = z.infer<typeof adminUserCreateSchema>;
export type AdminUserUpdateInput = z.infer<typeof adminUserUpdateSchema>;
