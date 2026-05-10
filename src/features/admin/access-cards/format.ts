export function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function formatAccessCardOwner(card: {
    userId: number | null;
    user: { name: string; email: string } | null;
}) {
    if (card.user) {
        return `${card.user.name} (${card.user.email})`;
    }

    if (card.userId) {
        return `User #${card.userId.toString()}`;
    }

    return "Unassigned";
}
