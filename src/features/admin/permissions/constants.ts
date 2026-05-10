import type { PermissionStatus } from "./types";

export const PERMISSION_STATUSES = ["ACTIVE", "SUSPENDED", "EXPIRED"] as const;

export const PERMISSION_STATUS_LABELS: Record<PermissionStatus, string> = {
    ACTIVE: "Active",
    SUSPENDED: "Suspended",
    EXPIRED: "Expired",
};
