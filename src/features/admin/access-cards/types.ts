export type CardType = "RFID";
export type CardStatus = "ACTIVE" | "DISABLED";

export interface AccessCardUserRef {
    id: number;
    name: string;
    email: string;
}

export interface AccessCardRow {
    id: number;
    uuid: string;
    userId: number | null;
    user: AccessCardUserRef | null;
    code: string;
    type: CardType;
    status: CardStatus;
    createdAt: string;
    updatedAt: string;
    assignedAt: string | null;
    deletedAt: string | null;
}

export interface AccessCardsOverview {
    accessCards: AccessCardRow[];
}

export interface AccessCardActionResult {
    success: boolean;
    message: string;
}

export interface AccessCardFormInput {
    code: string;
    type: CardType;
    status: CardStatus;
    userId: number | null;
}
