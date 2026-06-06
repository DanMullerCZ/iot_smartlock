export interface LockRoomRef {
    id: number;
    name: string;
    location: string | null;
}

export interface LockRow {
    id: number;
    name: string | null;
    description: string | null;
    roomId: number;
    room: LockRoomRef;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
}

export type LockRoomOption = LockRoomRef;

export interface LocksOverview {
    locks: LockRow[];
    roomOptions: LockRoomOption[];
}

export interface LockActionResult {
    success: boolean;
    message: string;
}

export interface LockFormInput {
    name: string;
    description: string;
    roomId: number | null;
}
