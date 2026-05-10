export type UserRole = "SUPER_ADMIN" | "ADMIN" | "USER";
export type UserStatus = "ACTIVE" | "DISABLED" | "NOT_VERIFIED";

export interface UserRow {
    id: number;
    uuid: string;
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface UsersOverview {
    users: UserRow[];
}

export interface UserActionResult {
    success: boolean;
    message: string;
}

export interface UserFormInput {
    name: string;
    email: string;
    role: UserRole;
    status: UserStatus;
}

export interface CreateUserFormInput extends UserFormInput {
    password: string;
}
