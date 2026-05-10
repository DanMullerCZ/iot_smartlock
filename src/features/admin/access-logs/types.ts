export type CardType = "RFID";
export type AccessResultValue = "OK" | "GENERIC_ERROR" | "DENIED" | "TIMEOUT";
export type AccessLogResultFilter = AccessResultValue | "ALL";

export interface AccessLogUserRef {
    id: number;
    name: string;
    email: string;
}

export interface AccessLogRoomRef {
    id: number;
    name: string;
    location: string | null;
}

export interface AccessLogCardRef {
    id: number;
    code: string;
    type: CardType;
}

export interface AccessResultEmbedded {
    id: string;
    accessRequestId: string;
    result: AccessResultValue;
    completedAt: string;
}

export interface AccessLogRequestRow {
    id: string;
    userId: number;
    user: AccessLogUserRef;
    cardId: number;
    card: AccessLogCardRef;
    roomId: number;
    room: AccessLogRoomRef;
    requestedAt: string;
    accessResult: AccessResultEmbedded | null;
}

export interface AccessLogResultRow {
    id: string;
    accessRequestId: string;
    result: AccessResultValue;
    completedAt: string;
    accessRequest: AccessLogRequestRow;
}

export interface AccessLogsOverview {
    requests: AccessLogRequestRow[];
    results: AccessLogResultRow[];
}
