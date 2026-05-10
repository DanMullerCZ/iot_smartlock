import { z } from "zod";

import { ROOM_STATUSES } from "./constants";

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

export const roomCreateSchema = z.object({
    name: z.string().trim().min(1).max(100),
    location: optionalText(255),
    description: optionalText(),
    status: z.enum(ROOM_STATUSES).default("DISABLED"),
});

export const roomPatchSchema = z
    .object({
        name: z.string().trim().min(1).max(100).optional(),
        location: nullableText(255),
        description: nullableText(),
        status: z.enum(ROOM_STATUSES).optional(),
    })
    .strict();

export const roomActionCreateSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    location: optionalText(255),
    description: optionalText(),
    status: z.enum(ROOM_STATUSES, { message: "Invalid status" }),
});

export const roomActionUpdateSchema = z.object({
    name: z.string().trim().min(1, "Name is required").max(100),
    location: nullableText(255),
    description: nullableText(),
    status: z.enum(ROOM_STATUSES, { message: "Invalid status" }),
});

export type RoomCreateInput = z.infer<typeof roomCreateSchema>;
export type RoomPatchInput = z.infer<typeof roomPatchSchema>;
export type RoomActionCreateInput = z.infer<typeof roomActionCreateSchema>;
export type RoomActionUpdateInput = z.infer<typeof roomActionUpdateSchema>;
