import { type z as Zod } from "zod";

export function buildParameters(z: typeof Zod) {
    const paginationQuery = z.object({
        page: z.coerce
            .number()
            .int()
            .min(1)
            .default(1)
            .optional()
            .openapi({ description: "Page number (1-based)", example: 1 }),
        limit: z.coerce
            .number()
            .int()
            .min(1)
            .max(100)
            .default(20)
            .optional()
            .openapi({ description: "Items per page (max 100)", example: 20 }),
    });

    const softDeleteQuery = z.object({
        includeDeleted: z
            .enum(["true", "false"])
            .default("false")
            .optional()
            .openapi({ description: "Include soft-deleted records" }),
    });

    const intPathParams = z.object({
        id: z.coerce.number().int().positive().openapi({ description: "Record ID" }),
    });

    const bigIntPathParams = z.object({
        id: z
            .string()
            .regex(/^\d+$/)
            .openapi({
                description: "BigInt ID as a decimal string",
                example: "1234567890123456789",
            }),
    });

    return { paginationQuery, softDeleteQuery, intPathParams, bigIntPathParams };
}