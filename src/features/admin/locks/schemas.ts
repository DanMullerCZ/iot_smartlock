import { z } from "zod";

function optionalText(max?: number) {
    const schema = max ? z.string().trim().max(max) : z.string().trim();

    return z.preprocess((value) => {
        if (typeof value === "string" && value.trim() === "") {
            return undefined;
        }

        return value;
    }, schema.optional());
}

function nullableText(max?: number) {
    const schema = max ? z.string().trim().max(max) : z.string().trim();

    return z.preprocess((value) => {
        if (typeof value === "string" && value.trim() === "") {
            return null;
        }

        return value;
    }, schema.nullable().optional());
}

export const lockCreateSchema = z.object({
    name: optionalText(255),
    description: optionalText(),
    roomId: z.number().int().positive(),
});

export const lockPatchSchema = z
    .object({
        name: nullableText(255),
        description: nullableText(),
        roomId: z.number().int().positive().optional(),
    })
    .strict();

export const lockActionCreateSchema = z.object({
    name: optionalText(255),
    description: optionalText(),
    roomId: z.number().int().positive("Room is required"),
});

export const lockActionUpdateSchema = z.object({
    name: nullableText(255),
    description: nullableText(),
    roomId: z.number().int().positive("Room is required"),
});

export type LockCreateInput = z.infer<typeof lockCreateSchema>;
export type LockPatchInput = z.infer<typeof lockPatchSchema>;
export type LockActionCreateInput = z.infer<typeof lockActionCreateSchema>;
export type LockActionUpdateInput = z.infer<typeof lockActionUpdateSchema>;
