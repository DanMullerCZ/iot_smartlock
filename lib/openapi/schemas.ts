import { z } from "zod";

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

import { registry } from "./registry";

// ─── Request schemas (reuse existing Zod validation schemas) ────────────────

export const RegisterRequestSchema = registry.register(
    "RegisterRequest",
    registerSchema.openapi("RegisterRequest"),
);

export const AdminUserCreateRequestSchema = registry.register(
    "AdminUserCreateRequest",
    adminUserCreateSchema.openapi("AdminUserCreateRequest"),
);

export const AdminUserUpdateRequestSchema = registry.register(
    "AdminUserUpdateRequest",
    adminUserUpdateSchema.openapi("AdminUserUpdateRequest"),
);

export const RoomCreateRequestSchema = registry.register(
    "RoomCreateRequest",
    roomCreateSchema.openapi("RoomCreateRequest"),
);

export const RoomUpdateRequestSchema = registry.register(
    "RoomUpdateRequest",
    roomUpdateSchema.openapi("RoomUpdateRequest"),
);

export const AccessCardCreateRequestSchema = registry.register(
    "AccessCardCreateRequest",
    accessCardCreateSchema.openapi("AccessCardCreateRequest"),
);

export const AccessCardUpdateRequestSchema = registry.register(
    "AccessCardUpdateRequest",
    accessCardUpdateSchema.openapi("AccessCardUpdateRequest"),
);

export const AccessPermissionCreateRequestSchema = registry.register(
    "AccessPermissionCreateRequest",
    accessPermissionCreateSchema.openapi("AccessPermissionCreateRequest"),
);

export const AccessPermissionUpdateRequestSchema = registry.register(
    "AccessPermissionUpdateRequest",
    accessPermissionUpdateSchema.openapi("AccessPermissionUpdateRequest"),
);

// ─── Shared sub-schemas ──────────────────────────────────────────────────────

const DateTimeNullable = z.iso.datetime().nullable();

export const PaginationMetaSchema = registry.register(
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

export const ErrorResponseSchema = registry.register(
    "ErrorResponse",
    z
        .object({ error: z.union([z.string(), z.record(z.string(), z.unknown())]) })
        .openapi("ErrorResponse"),
);

// ─── User ────────────────────────────────────────────────────────────────────

export const UserSchema = registry.register(
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

export const UserListResponseSchema = registry.register(
    "UserListResponse",
    z.object({ data: z.array(UserSchema), meta: PaginationMetaSchema }).openapi("UserListResponse"),
);

// ─── Room ────────────────────────────────────────────────────────────────────

export const RoomSchema = registry.register(
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

export const RoomListResponseSchema = registry.register(
    "RoomListResponse",
    z.object({ data: z.array(RoomSchema), meta: PaginationMetaSchema }).openapi("RoomListResponse"),
);

// ─── Access Card ─────────────────────────────────────────────────────────────

const UserRefSchema = z.object({ id: z.number().int(), name: z.string(), email: z.string() });

export const AccessCardSchema = registry.register(
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

export const AccessCardListResponseSchema = registry.register(
    "AccessCardListResponse",
    z
        .object({ data: z.array(AccessCardSchema), meta: PaginationMetaSchema })
        .openapi("AccessCardListResponse"),
);

// ─── Access Permission ───────────────────────────────────────────────────────

const RoomRefSchema = z.object({
    id: z.number().int(),
    name: z.string(),
    location: z.string().nullable(),
});

export const AccessPermissionSchema = registry.register(
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

export const AccessPermissionListResponseSchema = registry.register(
    "AccessPermissionListResponse",
    z
        .object({ data: z.array(AccessPermissionSchema), meta: PaginationMetaSchema })
        .openapi("AccessPermissionListResponse"),
);

// ─── Access Request / Result (BigInt IDs serialized as strings) ───────────────

// Avoid circular reference: embed result without back-ref
const AccessResultEmbeddedSchema = z.object({
    id: z
        .string()
        .openapi({
            description: "BigInt serialized as decimal string",
            example: "1234567890123456789",
        }),
    accessRequestId: z.string().openapi({ description: "BigInt serialized as decimal string" }),
    result: z.enum(["OK", "GENERIC_ERROR", "DENIED", "TIMEOUT"]),
    completedAt: z.iso.datetime(),
});

const CardRefSchema = z.object({ id: z.number().int(), code: z.string(), type: z.enum(["RFID"]) });

export const AccessRequestSchema = registry.register(
    "AccessRequest",
    z
        .object({
            id: z
                .string()
                .openapi({
                    description: "BigInt serialized as decimal string",
                    example: "1234567890123456789",
                }),
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

export const AccessRequestListResponseSchema = registry.register(
    "AccessRequestListResponse",
    z
        .object({ data: z.array(AccessRequestSchema), meta: PaginationMetaSchema })
        .openapi("AccessRequestListResponse"),
);

// Embed request without back-ref to avoid circular reference
const AccessRequestEmbeddedSchema = z.object({
    id: z.string().openapi({ description: "BigInt serialized as decimal string" }),
    userId: z.number().int(),
    user: UserRefSchema,
    cardId: z.number().int(),
    card: CardRefSchema,
    roomId: z.number().int(),
    room: RoomRefSchema,
    requestedAt: z.iso.datetime(),
});

export const AccessResultSchema = registry.register(
    "AccessResult",
    z
        .object({
            id: z
                .string()
                .openapi({
                    description: "BigInt serialized as decimal string",
                    example: "1234567890123456789",
                }),
            accessRequestId: z
                .string()
                .openapi({ description: "BigInt serialized as decimal string" }),
            result: z.enum(["OK", "GENERIC_ERROR", "DENIED", "TIMEOUT"]),
            completedAt: z.iso.datetime(),
            accessRequest: AccessRequestEmbeddedSchema,
        })
        .openapi("AccessResult"),
);

export const AccessResultListResponseSchema = registry.register(
    "AccessResultListResponse",
    z
        .object({ data: z.array(AccessResultSchema), meta: PaginationMetaSchema })
        .openapi("AccessResultListResponse"),
);
