import { z } from "zod";

export const accessCardCreateSchema = z.object({
    code: z.string().min(1).max(128),
    type: z.enum(["RFID"]).default("RFID"),
    status: z.enum(["ACTIVE", "DISABLED"]).default("DISABLED"),
    userId: z.number().int().positive().optional(),
});

export const accessCardUpdateSchema = z
    .object({
        code: z.string().min(1).max(128).optional(),
        type: z.enum(["RFID"]).optional(),
        status: z.enum(["ACTIVE", "DISABLED"]).optional(),
        userId: z.number().int().positive().nullable().optional(),
    })
    .strict();

export type AccessCardCreateInput = z.infer<typeof accessCardCreateSchema>;
export type AccessCardUpdateInput = z.infer<typeof accessCardUpdateSchema>;
