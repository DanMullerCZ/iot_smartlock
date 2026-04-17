import { z } from "zod";

export const roomCreateSchema = z.object({
    name: z.string().min(1).max(100),
    location: z.string().max(255).optional(),
    description: z.string().optional(),
    status: z.enum(["ACTIVE", "BLOCKED", "DISABLED"]).default("DISABLED"),
});

export const roomUpdateSchema = z
    .object({
        name: z.string().min(1).max(100).optional(),
        location: z.string().max(255).nullable().optional(),
        description: z.string().nullable().optional(),
        status: z.enum(["ACTIVE", "BLOCKED", "DISABLED"]).optional(),
    })
    .strict();

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomUpdateInput = z.infer<typeof roomUpdateSchema>;
