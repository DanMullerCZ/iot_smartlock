import type { RoomStatus } from "./types";

export const ROOM_STATUSES = ["ACTIVE", "BLOCKED", "DISABLED"] as const;

export const ROOM_STATUS_LABELS: Record<RoomStatus, string> = {
    ACTIVE: "Active",
    BLOCKED: "Blocked",
    DISABLED: "Disabled",
};
