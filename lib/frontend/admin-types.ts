export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface ListResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

export interface DataResponse<T> {
    data: T;
}

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type UserStatus = "NOT_VERIFIED" | "ACTIVE" | "DISABLED";
export type RoomStatus = "ACTIVE" | "BLOCKED" | "DISABLED";
export type CardStatus = "ACTIVE" | "DISABLED";
export type CardType = "RFID";
export type PermissionStatus = "ACTIVE" | "SUSPENDED" | "EXPIRED";
export type AccessResultValue = "OK" | "GENERIC_ERROR" | "DENIED" | "TIMEOUT";

export interface UserRef {
    id: number;
    name: string;
    email: string;
}

export interface RoomRef {
    id: number;
    name: string;
    location: string | null;
}

export interface CardRef {
    id: number;
    code: string;
    type: CardType;
}

export interface AdminUser {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt?: string;
    deletedAt: string | null;
}

export interface Room {
    id: number;
    uuid: string;
    name: string;
    location: string | null;
    description: string | null;
    status: RoomStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AccessCard {
    id: number;
    uuid: string;
    code: string;
    type: CardType;
    status: CardStatus;
    userId: number | null;
    user: UserRef | null;
    assignedAt: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AccessPermission {
    id: number;
    userId: number;
    user: UserRef;
    roomId: number;
    room: RoomRef;
    status: PermissionStatus;
    from: string | null;
    to: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface AccessResultEmbedded {
    id: string;
    accessRequestId: string;
    result: AccessResultValue;
    completedAt: string;
}

export interface AccessRequest {
    id: string;
    userId: number;
    user: UserRef;
    cardId: number;
    card: CardRef;
    roomId: number;
    room: RoomRef;
    requestedAt: string;
    accessResult: AccessResultEmbedded | null;
}

export interface AccessResult {
    id: string;
    accessRequestId: string;
    result: AccessResultValue;
    completedAt: string;
    accessRequest: AccessRequest;
}

export type ResourceName = "users" | "rooms" | "access-cards" | "access-permissions";

export interface UserFormInput {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    status: UserStatus;
}

export interface RoomFormInput {
    name: string;
    location?: string;
    description?: string;
    status: RoomStatus;
}

export interface CardFormInput {
    code: string;
    type: CardType;
    status: CardStatus;
    userId?: number | null;
}

export interface PermissionFormInput {
    userId: number;
    roomId: number;
    status: PermissionStatus;
    from?: string;
    to?: string;
}
