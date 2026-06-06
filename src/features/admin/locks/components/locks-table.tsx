"use client";

import { KeyRound, Search } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { createLockAction, deleteLockAction, updateLockAction } from "../actions";
import type { LockFormInput, LockRoomOption, LockRow } from "../types";
import { DeleteLockDialog } from "./delete-lock-dialog";
import { LockFormDialog } from "./lock-form-dialog";
import { getLockColumns } from "./locks-table-columns";

interface LocksTableProps {
    locks: LockRow[];
    roomOptions: LockRoomOption[];
}

export function LocksTable({ locks, roomOptions }: LocksTableProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingLock, setEditingLock] = useState<LockRow | null>(null);
    const [deletingLock, setDeletingLock] = useState<LockRow | null>(null);

    const columns = useMemo(() => {
        return getLockColumns({
            onEdit: setEditingLock,
            onDelete: setDeletingLock,
        });
    }, []);

    function handleCreateLock(input: LockFormInput) {
        startTransition(async () => {
            const response = await createLockAction(input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setCreateDialogOpen(false);
        });
    }

    function handleUpdateLock(input: LockFormInput) {
        if (!editingLock) {
            return;
        }

        startTransition(async () => {
            const response = await updateLockAction(editingLock.id, input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setEditingLock(null);
        });
    }

    function handleDeleteLock() {
        if (!deletingLock) {
            return;
        }

        startTransition(async () => {
            const response = await deleteLockAction(deletingLock.id);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setDeletingLock(null);
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
                            New lock
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search locks" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={locks}
                        meta={null}
                        loading={false}
                        onPageChange={() => {
                            return undefined;
                        }}
                        empty={
                            <EmptyState
                                icon={KeyRound}
                                title="No locks found"
                                description="Create a lock or adjust the current filters."
                            />
                        }
                    />
                </CardContent>
            </Card>

            <LockFormDialog
                mode="create"
                open={createDialogOpen}
                roomOptions={roomOptions}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateLock}
            />

            <LockFormDialog
                mode="edit"
                open={editingLock !== null}
                lock={editingLock}
                roomOptions={roomOptions}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingLock(null);
                    }
                }}
                onSubmit={handleUpdateLock}
            />

            <DeleteLockDialog
                open={deletingLock !== null}
                lock={deletingLock}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingLock(null);
                    }
                }}
                onConfirm={handleDeleteLock}
            />
        </>
    );
}
