import type { UserRole, UserStatus } from "./types";

export const USER_ROLES = ["SUPER_ADMIN", "ADMIN", "USER"] as const;
export const USER_STATUSES = ["ACTIVE", "DISABLED", "NOT_VERIFIED"] as const;

export const USER_ROLE_LABELS: Record<UserRole, string> = {
    SUPER_ADMIN: "Super Admin",
    ADMIN: "Admin",
    USER: "User",
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
    ACTIVE: "Active",
    DISABLED: "Disabled",
    NOT_VERIFIED: "Not verified",
};
