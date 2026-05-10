import type { DashboardAccessRequest, AccessResultValue } from "./types";

export function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatDashboardUser(row: DashboardAccessRequest) {
    return `${row.user.name} · ${row.user.email}`;
}

export function getDashboardRequestResult(row: DashboardAccessRequest): AccessResultValue {
    return row.accessResult?.result ?? "TIMEOUT";
}
