import { z } from "zod";

export const accessPermissionCreateSchema = z.object({
    userId: z.number().int().positive(),
    roomId: z.number().int().positive(),
    status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).default("ACTIVE"),
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
});

export const accessPermissionUpdateSchema = z
    .object({
        status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
        from: z.iso.datetime().nullable().optional(),
        to: z.iso.datetime().nullable().optional(),
    })
    .strict();

export type AccessPermissionCreateInput = z.infer<typeof accessPermissionCreateSchema>;
export type AccessPermissionUpdateInput = z.infer<typeof accessPermissionUpdateSchema>;
