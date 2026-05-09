import { z } from "zod";

import { PERMISSION_STATUSES } from "./constants";

const positiveId = z.preprocess((value) => {
    if (typeof value === "string") {
        return Number(value);
    }

    return value;
}, z.number().int().positive());

const optionalDateTime = z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }

    return value;
}, z.iso.datetime().optional());

const nullableDateTime = z.preprocess((value) => {
    if (value === "" || value === undefined) {
        return null;
    }

    return value;
}, z.iso.datetime().nullable().optional());

export const accessPermissionCreateSchema = z.object({
    userId: positiveId,
    roomId: positiveId,
    status: z.enum(PERMISSION_STATUSES).default("ACTIVE"),
    from: optionalDateTime,
    to: optionalDateTime,
});

export const accessPermissionPatchSchema = z
    .object({
        status: z.enum(PERMISSION_STATUSES).optional(),
        from: nullableDateTime,
        to: nullableDateTime,
    })
    .strict();

export const accessPermissionActionCreateSchema = z.object({
    userId: positiveId,
    roomId: positiveId,
    status: z.enum(PERMISSION_STATUSES, { message: "Invalid status" }),
    from: optionalDateTime,
    to: optionalDateTime,
});

export const accessPermissionActionUpdateSchema = z.object({
    status: z.enum(PERMISSION_STATUSES, { message: "Invalid status" }),
    from: nullableDateTime,
    to: nullableDateTime,
});

export type AccessPermissionCreateInput = z.infer<typeof accessPermissionCreateSchema>;
export type AccessPermissionPatchInput = z.infer<typeof accessPermissionPatchSchema>;
export type AccessPermissionActionCreateInput = z.infer<typeof accessPermissionActionCreateSchema>;
export type AccessPermissionActionUpdateInput = z.infer<typeof accessPermissionActionUpdateSchema>;
