import type { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import type { z as Zod } from "zod";

// All schemas are created inside this factory so they use the z instance that
// has already been patched by extendZodWithOpenApi(z) in spec.ts. Importing
// pre-existing Zod schemas from lib/validations/* and passing them to
// registry.register() would fail in production because registry.register()
// calls .openapi() on the schema immediately, and Zod 4 does not retroactively
// add that method to instances created before extendZodWithOpenApi ran.
export function buildSchemas(z: typeof Zod, registry: OpenAPIRegistry) {
    const DateTimeNullable = z.iso.datetime().nullable();

    // ─── Request schemas ──────────────────────────────────────────────────────
    const AdminUserCreateRequestSchema = registry.register(
        "AdminUserCreateRequest",
        z.object({
            name: z.string().min(1).max(100),
            email: z.email(),
            password: z.string().min(8).max(64),
            role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).default("USER"),
            status: z.enum(["NOT_VERIFIED", "ACTIVE", "DISABLED"]).default("NOT_VERIFIED"),
        }),
    );
    const AdminUserUpdateRequestSchema = registry.register(
        "AdminUserUpdateRequest",
        z.object({
            name: z.string().min(1).max(100).optional(),
            email: z.email().optional(),
            role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]).optional(),
            status: z.enum(["NOT_VERIFIED", "ACTIVE", "DISABLED"]).optional(),
        }),
    );
    const RoomCreateRequestSchema = registry.register(
        "RoomCreateRequest",
        z.object({
            name: z.string().min(1).max(100),
            location: z.string().max(255).optional(),
            description: z.string().optional(),
            status: z.enum(["ACTIVE", "BLOCKED", "DISABLED"]).default("DISABLED"),
        }),
    );
    const RoomUpdateRequestSchema = registry.register(
        "RoomUpdateRequest",
        z.object({
            name: z.string().min(1).max(100).optional(),
            location: z.string().max(255).nullable().optional(),
            description: z.string().nullable().optional(),
            status: z.enum(["ACTIVE", "BLOCKED", "DISABLED"]).optional(),
        }),
    );
    const AccessCardCreateRequestSchema = registry.register(
        "AccessCardCreateRequest",
        z.object({
            code: z.string().min(1).max(128),
            type: z.enum(["RFID"]).default("RFID"),
            status: z.enum(["ACTIVE", "DISABLED"]).default("DISABLED"),
            userId: z.number().int().positive().optional(),
        }),
    );
    const AccessCardUpdateRequestSchema = registry.register(
        "AccessCardUpdateRequest",
        z.object({
            code: z.string().min(1).max(128).optional(),
            type: z.enum(["RFID"]).optional(),
            status: z.enum(["ACTIVE", "DISABLED"]).optional(),
            userId: z.number().int().positive().nullable().optional(),
        }),
    );
    const AccessPermissionCreateRequestSchema = registry.register(
        "AccessPermissionCreateRequest",
        z.object({
            userId: z.number().int().positive(),
            roomId: z.number().int().positive(),
            status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).default("ACTIVE"),
            from: z.iso.datetime().optional(),
            to: z.iso.datetime().optional(),
        }),
    );
    const AccessPermissionUpdateRequestSchema = registry.register(
        "AccessPermissionUpdateRequest",
        z.object({
            status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]).optional(),
            from: z.iso.datetime().nullable().optional(),
            to: z.iso.datetime().nullable().optional(),
        }),
    );

    // ─── Shared sub-schemas ──────────────────────────────────────────────────────
    const PaginationMetaSchema = registry.register(
        "PaginationMeta",
        z
            .object({
                total: z.number().int(),
                page: z.number().int(),
                limit: z.number().int(),
                totalPages: z.number().int(),
            })
            .openapi("PaginationMeta"),
    );

    const ErrorResponseSchema = registry.register(
        "ErrorResponse",
        z
            .object({ error: z.union([z.string(), z.record(z.string(), z.unknown())]) })
            .openapi("ErrorResponse"),
    );

    // ─── User ──────────────────────────────────────────────────────────────────
    const UserSchema = registry.register(
        "User",
        z
            .object({
                id: z.number().int(),
                uuid: z.uuid(),
                name: z.string(),
                email: z.email(),
                role: z.enum(["SUPER_ADMIN", "ADMIN", "USER"]),
                status: z.enum(["NOT_VERIFIED", "ACTIVE", "DISABLED"]),
                createdAt: z.iso.datetime(),
                updatedAt: z.iso.datetime(),
                deletedAt: DateTimeNullable,
            })
            .openapi("User"),
    );

    const UserListResponseSchema = registry.register(
        "UserListResponse",
        z
            .object({ data: z.array(UserSchema), meta: PaginationMetaSchema })
            .openapi("UserListResponse"),
    );

    // ─── Room ──────────────────────────────────────────────────────────────────
    const RoomSchema = registry.register(
        "Room",
        z
            .object({
                id: z.number().int(),
                uuid: z.uuid(),
                name: z.string(),
                location: z.string().nullable(),
                description: z.string().nullable(),
                status: z.enum(["ACTIVE", "BLOCKED", "DISABLED"]),
                createdAt: z.iso.datetime(),
                updatedAt: z.iso.datetime(),
                deletedAt: DateTimeNullable,
            })
            .openapi("Room"),
    );

    const RoomListResponseSchema = registry.register(
        "RoomListResponse",
        z
            .object({ data: z.array(RoomSchema), meta: PaginationMetaSchema })
            .openapi("RoomListResponse"),
    );

    // ─── Access Card ───────────────────────────────────────────────────────────
    const UserRefSchema = z.object({ id: z.number().int(), name: z.string(), email: z.string() });

    const AccessCardSchema = registry.register(
        "AccessCard",
        z
            .object({
                id: z.number().int(),
                uuid: z.uuid(),
                code: z.string(),
                type: z.enum(["RFID"]),
                status: z.enum(["ACTIVE", "DISABLED"]),
                userId: z.number().int().nullable(),
                user: UserRefSchema.nullable(),
                assignedAt: DateTimeNullable,
                createdAt: z.iso.datetime(),
                updatedAt: z.iso.datetime(),
                deletedAt: DateTimeNullable,
            })
            .openapi("AccessCard"),
    );

    const AccessCardListResponseSchema = registry.register(
        "AccessCardListResponse",
        z
            .object({ data: z.array(AccessCardSchema), meta: PaginationMetaSchema })
            .openapi("AccessCardListResponse"),
    );

    // ─── Access Permission ─────────────────────────────────────────────────────
    const RoomRefSchema = z.object({
        id: z.number().int(),
        name: z.string(),
        location: z.string().nullable(),
    });

    const AccessPermissionSchema = registry.register(
        "AccessPermission",
        z
            .object({
                id: z.number().int(),
                userId: z.number().int(),
                user: UserRefSchema,
                roomId: z.number().int(),
                room: RoomRefSchema,
                status: z.enum(["ACTIVE", "SUSPENDED", "EXPIRED"]),
                from: DateTimeNullable,
                to: DateTimeNullable,
                createdAt: z.iso.datetime(),
                updatedAt: z.iso.datetime(),
                deletedAt: DateTimeNullable,
            })
            .openapi("AccessPermission"),
    );

    const AccessPermissionListResponseSchema = registry.register(
        "AccessPermissionListResponse",
        z
            .object({ data: z.array(AccessPermissionSchema), meta: PaginationMetaSchema })
            .openapi("AccessPermissionListResponse"),
    );

    // ─── Access Request / Result ───────────────────────────────────────────────
    const CardRefSchema = z.object({
        id: z.number().int(),
        code: z.string(),
        type: z.enum(["RFID"]),
    });
    const BigIntId = z
        .string()
        .openapi({ description: "BigInt serialized as decimal string", example: "123456789" });

    const AccessResultEmbeddedSchema = z.object({
        id: BigIntId,
        accessRequestId: BigIntId,
        result: z.enum(["OK", "GENERIC_ERROR", "DENIED", "TIMEOUT"]),
        completedAt: z.iso.datetime(),
    });

    const AccessRequestSchema = registry.register(
        "AccessRequest",
        z
            .object({
                id: BigIntId,
                userId: z.number().int(),
                user: UserRefSchema,
                cardId: z.number().int(),
                card: CardRefSchema,
                roomId: z.number().int(),
                room: RoomRefSchema,
                requestedAt: z.iso.datetime(),
                accessResult: AccessResultEmbeddedSchema.nullable(),
            })
            .openapi("AccessRequest"),
    );

    const AccessRequestListResponseSchema = registry.register(
        "AccessRequestListResponse",
        z
            .object({ data: z.array(AccessRequestSchema), meta: PaginationMetaSchema })
            .openapi("AccessRequestListResponse"),
    );

    const AccessRequestEmbeddedSchema = z.object({
        id: BigIntId,
        userId: z.number().int(),
        user: UserRefSchema,
        cardId: z.number().int(),
        card: CardRefSchema,
        roomId: z.number().int(),
        room: RoomRefSchema,
        requestedAt: z.iso.datetime(),
    });

    const AccessResultSchema = registry.register(
        "AccessResult",
        z
            .object({
                id: BigIntId,
                accessRequestId: BigIntId,
                result: z.enum(["OK", "GENERIC_ERROR", "DENIED", "TIMEOUT"]),
                completedAt: z.iso.datetime(),
                accessRequest: AccessRequestEmbeddedSchema,
            })
            .openapi("AccessResult"),
    );

    const AccessResultListResponseSchema = registry.register(
        "AccessResultListResponse",
        z
            .object({ data: z.array(AccessResultSchema), meta: PaginationMetaSchema })
            .openapi("AccessResultListResponse"),
    );

    return {
        AdminUserCreateRequestSchema,
        AdminUserUpdateRequestSchema,
        RoomCreateRequestSchema,
        RoomUpdateRequestSchema,
        AccessCardCreateRequestSchema,
        AccessCardUpdateRequestSchema,
        AccessPermissionCreateRequestSchema,
        AccessPermissionUpdateRequestSchema,
        ErrorResponseSchema,
        UserSchema,
        UserListResponseSchema,
        RoomSchema,
        RoomListResponseSchema,
        AccessCardSchema,
        AccessCardListResponseSchema,
        AccessPermissionSchema,
        AccessPermissionListResponseSchema,
        AccessRequestSchema,
        AccessRequestListResponseSchema,
        AccessResultSchema,
        AccessResultListResponseSchema,
    };
}