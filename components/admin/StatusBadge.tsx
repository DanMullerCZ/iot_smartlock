import { Badge } from "@/components/ui/badge";
import type {
    AccessResultValue,
    CardStatus,
    PermissionStatus,
    RoomStatus,
    UserRole,
    UserStatus,
} from "@/lib/frontend/admin-types";

export type StatusValue =
    | UserStatus
    | UserRole
    | RoomStatus
    | CardStatus
    | PermissionStatus
    | AccessResultValue;

function labelForStatus(value: StatusValue) {
    return value
        .toLowerCase()
        .split("_")
        .map((part) => {
            return part.charAt(0).toUpperCase() + part.slice(1);
        })
        .join(" ");
}

function variantForStatus(value: StatusValue) {
    if (value === "ACTIVE" || value === "OK") {
        return "success" as const;
    }

    if (
        value === "NOT_VERIFIED" ||
        value === "EXPIRED" ||
        value === "TIMEOUT" ||
        value === "ADMIN"
    ) {
        return "warning" as const;
    }

    if (value === "DISABLED" || value === "DENIED" || value === "GENERIC_ERROR") {
        return "danger" as const;
    }

    if (value === "SUPER_ADMIN" || value === "USER") {
        return "info" as const;
    }

    return "muted" as const;
}

export function StatusBadge({ value }: { value: StatusValue }) {
    return (
        <Badge className="w-full" variant={variantForStatus(value)}>
            {labelForStatus(value)}
        </Badge>
    );
}
