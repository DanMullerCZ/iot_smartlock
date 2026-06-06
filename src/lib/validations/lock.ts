import { z } from "zod";

export const lockCreateSchema = z.object({
    name: z.string().max(255).nullable().optional(),
    description: z.string().nullable().optional(),
    roomId: z.number().int().positive(),
});

export const lockUpdateSchema = z
    .object({
        name: z.string().max(255).nullable().optional(),
        description: z.string().nullable().optional(),
        roomId: z.number().int().positive().optional(),
    })
    .strict();

export type LockCreateInput = z.infer<typeof lockCreateSchema>;
export type LockUpdateInput = z.infer<typeof lockUpdateSchema>;
