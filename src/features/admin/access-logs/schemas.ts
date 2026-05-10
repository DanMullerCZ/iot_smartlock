import { z } from "zod";

import { ACCESS_RESULT_VALUES } from "./constants";

const optionalPositiveInt = z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }

    return typeof value === "string" ? Number(value) : value;
}, z.number().int().positive().optional());

const optionalDate = z.preprocess((value) => {
    if (value === "" || value === null || value === undefined) {
        return undefined;
    }

    return value;
}, z.coerce.date().optional());

export const accessRequestFiltersSchema = z.object({
    userId: optionalPositiveInt,
    roomId: optionalPositiveInt,
    cardId: optionalPositiveInt,
    from: optionalDate,
    to: optionalDate,
});

export const accessResultFiltersSchema = z.object({
    result: z.enum(ACCESS_RESULT_VALUES).optional(),
    from: optionalDate,
    to: optionalDate,
});

export type AccessRequestFiltersInput = z.infer<typeof accessRequestFiltersSchema>;
export type AccessResultFiltersInput = z.infer<typeof accessResultFiltersSchema>;
