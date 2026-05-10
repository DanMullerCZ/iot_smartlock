export type PermissionStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";

export interface PermissionUserRef {
    id: number;
    name: string;
    email: string;
}

export interface PermissionRoomRef {
    id: number;
    name: string;
    location: string | null;
}

export interface AccessPermissionRow {
    id: number;
    userId: number;
    user: PermissionUserRef;
    roomId: number;
    room: PermissionRoomRef;
    status: PermissionStatus;
    from: string | null;
    to: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface PermissionsOverview {
    accessPermissions: AccessPermissionRow[];
}

export interface PermissionActionResult {
    success: boolean;
    message: string;
}

export interface PermissionCreateFormInput {
    userId: number;
    roomId: number;
    status: PermissionStatus;
    from?: string;
    to?: string;
}

export interface PermissionUpdateFormInput {
    status: PermissionStatus;
    from: string | null;
    to: string | null;
}
