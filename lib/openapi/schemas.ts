import { type OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { type z as Zod } from "zod";

import { accessCardCreateSchema, accessCardUpdateSchema } from "@/lib/validations/access-card";
import {
    accessPermissionCreateSchema,
    accessPermissionUpdateSchema,
} from "@/lib/validations/access-permission";
import { roomCreateSchema, roomUpdateSchema } from "@/lib/validations/room";
import {
    adminUserCreateSchema,
    adminUserUpdateSchema,
    registerSchema,
} from "@/lib/validations/user";

export function buildSchemas(z: typeof Zod, registry: OpenAPIRegistry) {
    const DateTimeNullable = z.iso.datetime().nullable();

    // ─── Request schemas (no .openapi() on imported schemas — different z instance) ──
    const RegisterRequestSchema = registry.register("RegisterRequest", registerSchema);
    const AdminUserCreateRequestSchema = registry.register(
        "AdminUserCreateRequest",
        adminUserCreateSchema,
    );
    const AdminUserUpdateRequestSchema = registry.register(
        "AdminUserUpdateRequest",
        adminUserUpdateSchema,
    );
    const RoomCreateRequestSchema = registry.register("RoomCreateRequest", roomCreateSchema);
    const RoomUpdateRequestSchema = registry.register("RoomUpdateRequest", roomUpdateSchema);
    const AccessCardCreateRequestSchema = registry.register(
        "AccessCardCreateRequest",
        accessCardCreateSchema,
    );
    const AccessCardUpdateRequestSchema = registry.register(
        "AccessCardUpdateRequest",
        accessCardUpdateSchema,
    );
    const AccessPermissionCreateRequestSchema = registry.register(
        "AccessPermissionCreateRequest",
        accessPermissionCreateSchema,
    );
    const AccessPermissionUpdateRequestSchema = registry.register(
        "AccessPermissionUpdateRequest",
        accessPermissionUpdateSchema,
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
        RegisterRequestSchema,
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