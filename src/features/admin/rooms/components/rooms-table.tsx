"use client";

import { Activity, Search } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { createRoomAction, deleteRoomAction, updateRoomAction } from "../actions";
import type { RoomFormInput, RoomRow } from "../types";
import { DeleteRoomDialog } from "./delete-room-dialog";
import { RoomFormDialog } from "./room-form-dialog";
import { getRoomColumns } from "./rooms-table-columns";

interface RoomsTableProps {
    rooms: RoomRow[];
}

export function RoomsTable({ rooms }: RoomsTableProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingRoom, setEditingRoom] = useState<RoomRow | null>(null);
    const [deletingRoom, setDeletingRoom] = useState<RoomRow | null>(null);

    const columns = useMemo(() => {
        return getRoomColumns({
            onEdit: setEditingRoom,
            onDelete: setDeletingRoom,
        });
    }, []);

    function handleCreateRoom(input: RoomFormInput) {
        startTransition(async () => {
            const response = await createRoomAction(input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setCreateDialogOpen(false);
        });
    }

    function handleUpdateRoom(input: RoomFormInput) {
        if (!editingRoom) {
            return;
        }

        startTransition(async () => {
            const response = await updateRoomAction(editingRoom.id, input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setEditingRoom(null);
        });
    }

    function handleDeleteRoom() {
        if (!deletingRoom) {
            return;
        }

        startTransition(async () => {
            const response = await deleteRoomAction(deletingRoom.id);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setDeletingRoom(null);
        });
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Directory</CardTitle>
                    <CardAction>
                        <Button
                            size="sm"
                            onClick={() => {
                                setCreateDialogOpen(true);
                            }}
                        >
                            New room
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search rooms" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={rooms}
                        meta={null}
                        loading={false}
                        onPageChange={() => {
                            return undefined;
                        }}
                        empty={
                            <EmptyState
                                icon={Activity}
                                title="No rooms found"
                                description="Create a room or adjust the current filters."
                            />
                        }
                    />
                </CardContent>
            </Card>

            <RoomFormDialog
                mode="create"
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateRoom}
            />

            <RoomFormDialog
                mode="edit"
                open={editingRoom !== null}
                room={editingRoom}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingRoom(null);
                    }
                }}
                onSubmit={handleUpdateRoom}
            />

            <DeleteRoomDialog
                open={deletingRoom !== null}
                room={deletingRoom}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingRoom(null);
                    }
                }}
                onConfirm={handleDeleteRoom}
            />
        </>
    );
}
