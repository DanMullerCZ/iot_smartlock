import type { MetricIconKey } from "./types";

export const RECENT_REQUEST_LIMIT = 6;

export const DASHBOARD_METRIC_META: Record<
    "activeUsers" | "activeRooms" | "activeCards" | "activePermissions" | "recentDenials",
    { label: string; help: string; icon: MetricIconKey }
> = {
    activeUsers: {
        label: "Active users",
        help: "Verified people with active accounts",
        icon: "users",
    },
    activeRooms: {
        label: "Active rooms",
        help: "Rooms available for access checks",
        icon: "rooms",
    },
    activeCards: {
        label: "Active cards",
        help: "RFID cards currently enabled",
        icon: "cards",
    },
    activePermissions: {
        label: "Active permissions",
        help: "User-room rules currently enabled",
        icon: "permissions",
    },
    recentDenials: {
        label: "Recent denials",
        help: "Denied attempts in the last 24 hours",
        icon: "activity",
    },
};
