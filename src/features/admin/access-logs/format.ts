import type { AccessLogRequestRow, AccessResultValue } from "./types";

export function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatAccessLogUser(row: { user: { name: string; email: string } }) {
    return `${row.user.name} · ${row.user.email}`;
}

export function formatAccessLogRoom(row: { room: { name: string; location: string | null } }) {
    return row.room.location ? `${row.room.name} · ${row.room.location}` : row.room.name;
}

export function getRequestResult(row: AccessLogRequestRow): AccessResultValue {
    return row.accessResult?.result ?? "TIMEOUT";
}

export function accessLogSearchText(row: AccessLogRequestRow) {
    return `${row.user.name} ${row.user.email} ${row.room.name} ${row.room.location ?? ""} ${row.card.code}`;
}
