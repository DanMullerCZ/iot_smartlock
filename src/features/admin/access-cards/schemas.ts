import { z } from "zod";

import { CARD_STATUSES, CARD_TYPES } from "./constants";

const optionalUserId = z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }

    if (typeof value === "string") {
        return Number(value);
    }

    return value;
}, z.number().int().positive().optional());

const nullableUserId = z.preprocess((value) => {
    if (value === "" || value === undefined) {
        return null;
    }

    if (typeof value === "string") {
        return Number(value);
    }

    return value;
}, z.number().int().positive().nullable().optional());

export const accessCardCreateSchema = z.object({
    code: z.string().trim().min(1).max(128),
    type: z.enum(CARD_TYPES).default("RFID"),
    status: z.enum(CARD_STATUSES).default("DISABLED"),
    userId: optionalUserId,
});

export const accessCardPatchSchema = z
    .object({
        code: z.string().trim().min(1).max(128).optional(),
        type: z.enum(CARD_TYPES).optional(),
        status: z.enum(CARD_STATUSES).optional(),
        userId: nullableUserId,
    })
    .strict();

export const accessCardActionCreateSchema = z.object({
    code: z.string().trim().min(1, "Card code is required").max(128),
    type: z.enum(CARD_TYPES, { message: "Invalid card type" }),
    status: z.enum(CARD_STATUSES, { message: "Invalid status" }),
    userId: optionalUserId,
});

export const accessCardActionUpdateSchema = z.object({
    code: z.string().trim().min(1, "Card code is required").max(128),
    type: z.enum(CARD_TYPES, { message: "Invalid card type" }),
    status: z.enum(CARD_STATUSES, { message: "Invalid status" }),
    userId: nullableUserId,
});

export type AccessCardCreateInput = z.infer<typeof accessCardCreateSchema>;
export type AccessCardPatchInput = z.infer<typeof accessCardPatchSchema>;
export type AccessCardActionCreateInput = z.infer<typeof accessCardActionCreateSchema>;
export type AccessCardActionUpdateInput = z.infer<typeof accessCardActionUpdateSchema>;
