import type { CardStatus, CardType } from "./types";

export const CARD_TYPES = ["RFID"] as const;
export const CARD_STATUSES = ["ACTIVE", "DISABLED"] as const;

export const CARD_TYPE_LABELS: Record<CardType, string> = {
    RFID: "RFID",
};

export const CARD_STATUS_LABELS: Record<CardStatus, string> = {
    ACTIVE: "Active",
    DISABLED: "Disabled",
};
