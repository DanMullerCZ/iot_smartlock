export function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function toDateTimeInputValue(value: string | null | undefined) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const timezoneOffsetMs = date.getTimezoneOffset() * 60_000;
    return new Date(date.getTime() - timezoneOffsetMs).toISOString().slice(0, 16);
}

export function localDateTimeToIso(value: string) {
    if (!value) {
        return "";
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return date.toISOString();
}

export function formatPermissionUser(permission: {
    userId: number;
    user?: { name: string; email: string } | null;
}) {
    if (permission.user) {
        return `${permission.user.name} (${permission.user.email})`;
    }

    return `User #${permission.userId.toString()}`;
}

export function formatPermissionRoom(permission: {
    roomId: number;
    room?: { name: string; location: string | null } | null;
}) {
    if (permission.room) {
        return permission.room.location
            ? `${permission.room.name} (${permission.room.location})`
            : permission.room.name;
    }

    return `Room #${permission.roomId.toString()}`;
}
