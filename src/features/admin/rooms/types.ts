export type RoomStatus = "ACTIVE" | "BLOCKED" | "DISABLED";

export interface RoomRow {
    id: number;
    uuid: string;
    name: string;
    location: string | null;
    description: string | null;
    status: RoomStatus;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export interface RoomsOverview {
    rooms: RoomRow[];
}

export interface RoomActionResult {
    success: boolean;
    message: string;
}

export interface RoomFormInput {
    name: string;
    location: string;
    description: string;
    status: RoomStatus;
}
