export function formatDate(value: string) {
    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatRoomLabel(room: { name: string; location: string | null }) {
    return room.location ? `${room.name} (${room.location})` : room.name;
}

export function formatLockName(lock: { name: string | null; room: { name: string } }) {
    return lock.name ?? `${lock.room.name} lock`;
}
