import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

// eslint-disable-next-line import/order
import { registry } from "./registry";

import "./schemas";

registry.registerComponent("securitySchemes", "BearerAuth", {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "NextAuth.js session token. Obtain via POST /api/auth/login.",
});

registry.registerComponent("securitySchemes", "BasicAuth", {
    type: "http",
    scheme: "basic",
    description:
        "Used only for /api/auth/login and POST /api/users. Format: base64(email:password).",
});
// eslint-disable-next-line import/order
import { bigIntPathParams, intPathParams, paginationQuery, softDeleteQuery } from "./parameters";
import {
    AccessCardCreateRequestSchema,
    AccessCardListResponseSchema,
    AccessCardSchema,
    AccessCardUpdateRequestSchema,
    AccessPermissionCreateRequestSchema,
    AccessPermissionListResponseSchema,
    AccessPermissionSchema,
    AccessPermissionUpdateRequestSchema,
    AccessRequestListResponseSchema,
    AccessRequestSchema,
    AccessResultListResponseSchema,
    AccessResultSchema,
    AdminUserCreateRequestSchema,
    AdminUserUpdateRequestSchema,
    ErrorResponseSchema,
    RoomCreateRequestSchema,
    RoomListResponseSchema,
    RoomSchema,
    RoomUpdateRequestSchema,
    UserListResponseSchema,
    UserSchema,
} from "./schemas";

const errorContent = { "application/json": { schema: ErrorResponseSchema } };

const errorResponses = {
    400: { description: "Invalid request", content: errorContent },
    401: { description: "Unauthorized — valid session token required", content: errorContent },
    403: { description: "Forbidden — SUPER_ADMIN role required", content: errorContent },
    422: { description: "Validation error", content: errorContent },
};

const bearerAuth = [{ BearerAuth: [] as string[] }];

const bigIntErrorResponses = {
    ...errorResponses,
    400: { description: "Invalid ID — must be a decimal string", content: errorContent },
};

// ─── System ──────────────────────────────────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/health",
    tags: ["System"],
    summary: "Health check",
    security: [],
    responses: {
        200: {
            description: "Service healthy",
            content: {
                "application/json": {
                    schema: z.object({
                        status: z.enum(["ok", "degraded"]),
                        db: z.enum(["ok", "error"]),
                    }),
                },
            },
        },
        503: { description: "Database unreachable" },
    },
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

registry.registerPath({
    method: "post",
    path: "/api/auth/login",
    tags: ["Auth"],
    summary: "Login — credentials via Basic Auth header, returns pre-auth token",
    description:
        "Credentials are passed as `Authorization: Basic base64(email:password)`. " +
        "Returns a short-lived HMAC token (30 s TTL) to be exchanged via NextAuth credentials flow.",
    security: [{ BasicAuth: [] as string[] }],
    responses: {
        200: {
            description: "Pre-auth token",
            content: {
                "application/json": {
                    schema: z.object({
                        token: z.string(),
                        email: z.email(),
                        name: z.string(),
                        uuid: z.uuid(),
                        issuedAt: z.number().int(),
                    }),
                },
            },
        },
        401: { description: "Invalid credentials" },
    },
});

registry.registerPath({
    method: "post",
    path: "/api/users",
    tags: ["Auth"],
    summary: "Register — credentials via Basic Auth header",
    description:
        "Email and password are passed as `Authorization: Basic base64(email:password)`. " +
        "Only `name` goes in the JSON body.",
    security: [{ BasicAuth: [] as string[] }],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: z.object({ name: z.string().min(1).max(100) }).openapi("RegisterBody"),
                },
            },
        },
    },
    responses: {
        201: {
            description: "User created",
            content: { "application/json": { schema: z.object({ data: UserSchema }) } },
        },
        409: { description: "Email already in use" },
        ...errorResponses,
    },
});

// ─── Admin / Users ────────────────────────────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/admin/users",
    tags: ["Admin / Users"],
    summary: "List users (paginated)",
    security: bearerAuth,
    request: {
        query: paginationQuery.extend(softDeleteQuery.shape).extend(
            z.object({
                role: z
                    .enum(["SUPER_ADMIN", "ADMIN", "USER"])
                    .optional()
                    .openapi({ description: "Filter by role" }),
                status: z
                    .enum(["NOT_VERIFIED", "ACTIVE", "DISABLED"])
                    .optional()
                    .openapi({ description: "Filter by status" }),
            }).shape,
        ),
    },
    responses: {
        200: {
            description: "Paginated user list",
            content: { "application/json": { schema: UserListResponseSchema } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/users",
    tags: ["Admin / Users"],
    summary: "Create user",
    security: bearerAuth,
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: AdminUserCreateRequestSchema } },
        },
    },
    responses: {
        201: {
            description: "User created",
            content: { "application/json": { schema: z.object({ data: UserSchema }) } },
        },
        409: { description: "Email already in use" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/users/{id}",
    tags: ["Admin / Users"],
    summary: "Get user by ID",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        200: {
            description: "User",
            content: { "application/json": { schema: z.object({ data: UserSchema }) } },
        },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/admin/users/{id}",
    tags: ["Admin / Users"],
    summary: "Update user",
    security: bearerAuth,
    request: {
        params: intPathParams,
        body: {
            required: true,
            content: { "application/json": { schema: AdminUserUpdateRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Updated user",
            content: { "application/json": { schema: z.object({ data: UserSchema }) } },
        },
        404: { description: "Not found" },
        409: { description: "Email already in use" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/users/{id}",
    tags: ["Admin / Users"],
    summary: "Soft-delete user",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

// ─── Admin / Rooms ────────────────────────────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/admin/rooms",
    tags: ["Admin / Rooms"],
    summary: "List rooms (paginated)",
    security: bearerAuth,
    request: {
        query: paginationQuery.extend(softDeleteQuery.shape).extend(
            z.object({
                status: z
                    .enum(["ACTIVE", "BLOCKED", "DISABLED"])
                    .optional()
                    .openapi({ description: "Filter by status" }),
            }).shape,
        ),
    },
    responses: {
        200: {
            description: "Paginated room list",
            content: { "application/json": { schema: RoomListResponseSchema } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/rooms",
    tags: ["Admin / Rooms"],
    summary: "Create room",
    security: bearerAuth,
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: RoomCreateRequestSchema } },
        },
    },
    responses: {
        201: {
            description: "Room created",
            content: { "application/json": { schema: z.object({ data: RoomSchema }) } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/rooms/{id}",
    tags: ["Admin / Rooms"],
    summary: "Get room by ID",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        200: {
            description: "Room",
            content: { "application/json": { schema: z.object({ data: RoomSchema }) } },
        },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/admin/rooms/{id}",
    tags: ["Admin / Rooms"],
    summary: "Update room",
    security: bearerAuth,
    request: {
        params: intPathParams,
        body: {
            required: true,
            content: { "application/json": { schema: RoomUpdateRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Updated room",
            content: { "application/json": { schema: z.object({ data: RoomSchema }) } },
        },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/rooms/{id}",
    tags: ["Admin / Rooms"],
    summary: "Soft-delete room",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

// ─── Admin / Access Cards ─────────────────────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/admin/access-cards",
    tags: ["Admin / Access Cards"],
    summary: "List access cards (paginated)",
    security: bearerAuth,
    request: {
        query: paginationQuery.extend(softDeleteQuery.shape).extend(
            z.object({
                status: z
                    .enum(["ACTIVE", "DISABLED"])
                    .optional()
                    .openapi({ description: "Filter by card status" }),
                userId: z.coerce
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .openapi({ description: "Filter by owner user ID" }),
            }).shape,
        ),
    },
    responses: {
        200: {
            description: "Paginated access card list",
            content: { "application/json": { schema: AccessCardListResponseSchema } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/access-cards",
    tags: ["Admin / Access Cards"],
    summary: "Create access card",
    security: bearerAuth,
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: AccessCardCreateRequestSchema } },
        },
    },
    responses: {
        201: {
            description: "Access card created",
            content: { "application/json": { schema: z.object({ data: AccessCardSchema }) } },
        },
        409: { description: "Card code already exists" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/access-cards/{id}",
    tags: ["Admin / Access Cards"],
    summary: "Get access card by ID",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        200: {
            description: "Access card",
            content: { "application/json": { schema: z.object({ data: AccessCardSchema }) } },
        },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/admin/access-cards/{id}",
    tags: ["Admin / Access Cards"],
    summary: "Update access card",
    security: bearerAuth,
    request: {
        params: intPathParams,
        body: {
            required: true,
            content: { "application/json": { schema: AccessCardUpdateRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Updated access card",
            content: { "application/json": { schema: z.object({ data: AccessCardSchema }) } },
        },
        404: { description: "Not found" },
        409: { description: "Card code already exists" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/access-cards/{id}",
    tags: ["Admin / Access Cards"],
    summary: "Soft-delete access card",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

// ─── Admin / Access Permissions ───────────────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/admin/access-permissions",
    tags: ["Admin / Access Permissions"],
    summary: "List access permissions (paginated)",
    security: bearerAuth,
    request: {
        query: paginationQuery.extend(softDeleteQuery.shape).extend(
            z.object({
                status: z
                    .enum(["ACTIVE", "SUSPENDED", "EXPIRED"])
                    .optional()
                    .openapi({ description: "Filter by permission status" }),
                userId: z.coerce
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .openapi({ description: "Filter by user ID" }),
                roomId: z.coerce
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .openapi({ description: "Filter by room ID" }),
            }).shape,
        ),
    },
    responses: {
        200: {
            description: "Paginated access permission list",
            content: { "application/json": { schema: AccessPermissionListResponseSchema } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "post",
    path: "/api/admin/access-permissions",
    tags: ["Admin / Access Permissions"],
    summary: "Create access permission",
    security: bearerAuth,
    request: {
        body: {
            required: true,
            content: { "application/json": { schema: AccessPermissionCreateRequestSchema } },
        },
    },
    responses: {
        201: {
            description: "Access permission created",
            content: {
                "application/json": { schema: z.object({ data: AccessPermissionSchema }) },
            },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/access-permissions/{id}",
    tags: ["Admin / Access Permissions"],
    summary: "Get access permission by ID",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        200: {
            description: "Access permission",
            content: {
                "application/json": { schema: z.object({ data: AccessPermissionSchema }) },
            },
        },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "patch",
    path: "/api/admin/access-permissions/{id}",
    tags: ["Admin / Access Permissions"],
    summary: "Update access permission",
    security: bearerAuth,
    request: {
        params: intPathParams,
        body: {
            required: true,
            content: { "application/json": { schema: AccessPermissionUpdateRequestSchema } },
        },
    },
    responses: {
        200: {
            description: "Updated access permission",
            content: {
                "application/json": { schema: z.object({ data: AccessPermissionSchema }) },
            },
        },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "delete",
    path: "/api/admin/access-permissions/{id}",
    tags: ["Admin / Access Permissions"],
    summary: "Soft-delete access permission",
    security: bearerAuth,
    request: { params: intPathParams },
    responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" },
        ...errorResponses,
    },
});

// ─── Admin / Access Requests (read-only) ─────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/admin/access-requests",
    tags: ["Admin / Access Requests"],
    summary: "List access requests (paginated)",
    security: bearerAuth,
    request: {
        query: paginationQuery.extend(
            z.object({
                userId: z.coerce
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .openapi({ description: "Filter by user ID" }),
                roomId: z.coerce
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .openapi({ description: "Filter by room ID" }),
                cardId: z.coerce
                    .number()
                    .int()
                    .positive()
                    .optional()
                    .openapi({ description: "Filter by card ID" }),
                from: z.iso
                    .datetime()
                    .optional()
                    .openapi({ description: "Filter by requestedAt ≥ from (ISO 8601)" }),
                to: z.iso
                    .datetime()
                    .optional()
                    .openapi({ description: "Filter by requestedAt ≤ to (ISO 8601)" }),
            }).shape,
        ),
    },
    responses: {
        200: {
            description: "Paginated access request list",
            content: { "application/json": { schema: AccessRequestListResponseSchema } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/access-requests/{id}",
    tags: ["Admin / Access Requests"],
    summary: "Get access request by ID",
    security: bearerAuth,
    request: { params: bigIntPathParams },
    responses: {
        200: {
            description: "Access request",
            content: {
                "application/json": { schema: z.object({ data: AccessRequestSchema }) },
            },
        },
        404: { description: "Not found" },
        ...bigIntErrorResponses,
    },
});

// ─── Admin / Access Results (read-only) ──────────────────────────────────────

registry.registerPath({
    method: "get",
    path: "/api/admin/access-results",
    tags: ["Admin / Access Results"],
    summary: "List access results (paginated)",
    security: bearerAuth,
    request: {
        query: paginationQuery.extend(
            z.object({
                result: z
                    .enum(["OK", "GENERIC_ERROR", "DENIED", "TIMEOUT"])
                    .optional()
                    .openapi({ description: "Filter by result" }),
                from: z.iso
                    .datetime()
                    .optional()
                    .openapi({ description: "Filter by completedAt ≥ from (ISO 8601)" }),
                to: z.iso
                    .datetime()
                    .optional()
                    .openapi({ description: "Filter by completedAt ≤ to (ISO 8601)" }),
            }).shape,
        ),
    },
    responses: {
        200: {
            description: "Paginated access result list",
            content: { "application/json": { schema: AccessResultListResponseSchema } },
        },
        ...errorResponses,
    },
});

registry.registerPath({
    method: "get",
    path: "/api/admin/access-results/{id}",
    tags: ["Admin / Access Results"],
    summary: "Get access result by ID",
    security: bearerAuth,
    request: { params: bigIntPathParams },
    responses: {
        200: {
            description: "Access result",
            content: { "application/json": { schema: z.object({ data: AccessResultSchema }) } },
        },
        404: { description: "Not found" },
        ...bigIntErrorResponses,
    },
});

// ─── Generate spec ────────────────────────────────────────────────────────────

type OpenApiDocument = ReturnType<InstanceType<typeof OpenApiGeneratorV3>["generateDocument"]>;
let cachedSpec: OpenApiDocument | null = null;

export function getOpenApiSpec(): OpenApiDocument {
    if (cachedSpec) {
        return cachedSpec;
    }

    const generator = new OpenApiGeneratorV3(registry.definitions);
    cachedSpec = generator.generateDocument({
        openapi: "3.0.3",
        info: {
            title: "IoT SmartLock API",
            version: "1.0.0",
            description:
                "Admin API for the IoT SmartLock system. " +
                "All `/api/admin/*` endpoints require a SUPER_ADMIN JWT.\n\n" +
                "**Auth flow:**\n" +
                "1. Call `POST /api/auth/login` with `Authorization: Basic base64(email:password)`\n" +
                "2. Copy the `token` from the response\n" +
                "3. Click **Authorize** and enter the token under **BearerAuth**",
        },
        servers: [{ url: process.env.NEXTAUTH_URL ?? "http://localhost:3000" }],
    });

    return cachedSpec;
}
