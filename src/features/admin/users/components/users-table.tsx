"use client";

import { Activity, Search } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { createUserAction, deleteUserAction, updateUserAction } from "../actions";
import type { UserRow, CreateUserFormInput, UserFormInput } from "../types";
import { DeleteUserDialog } from "./delete-user-dialog";
import { UserFormDialog } from "./user-form-dialog";
import { getUserColumns } from "./users-table-columns";

interface UsersTableProps {
    users: UserRow[];
}

export function UsersTable({ users }: UsersTableProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<UserRow | null>(null);
    const [deletingUser, setDeletingUser] = useState<UserRow | null>(null);

    const columns = useMemo(() => {
        return getUserColumns({
            onEdit: setEditingUser,
            onDelete: setDeletingUser,
        });
    }, [setDeletingUser, setEditingUser]);

    function handleCreateUser(input: CreateUserFormInput) {
        startTransition(async () => {
            const response = await createUserAction(input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setCreateDialogOpen(false);
        });
    }

    function handleUpdateUser(input: UserFormInput) {
        if (!editingUser) {
            return;
        }

        startTransition(async () => {
            const response = await updateUserAction(editingUser.id, input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setEditingUser(null);
        });
    }

    function handleDeleteUser() {
        if (!deletingUser) {
            return;
        }

        startTransition(async () => {
            const response = await deleteUserAction(deletingUser.id);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setDeletingUser(null);
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
                            New user
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search user or email" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={users}
                        meta={null}
                        loading={false}
                        onPageChange={() => {
                            return undefined;
                        }}
                        empty={
                            <EmptyState
                                icon={Activity}
                                title="No users found"
                                description="Create an account or adjust the current filters."
                            />
                        }
                    />
                </CardContent>
            </Card>

            <UserFormDialog
                mode="create"
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateUser}
            />

            <UserFormDialog
                mode="edit"
                open={editingUser !== null}
                user={editingUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingUser(null);
                    }
                }}
                onSubmit={handleUpdateUser}
            />

            <DeleteUserDialog
                open={deletingUser !== null}
                user={deletingUser}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingUser(null);
                    }
                }}
                onConfirm={handleDeleteUser}
            />
        </>
    );
}
