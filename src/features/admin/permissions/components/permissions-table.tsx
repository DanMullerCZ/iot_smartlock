"use client";

import { Activity, Search } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { createPermissionAction, deletePermissionAction, updatePermissionAction } from "../actions";
import type {
    AccessPermissionRow,
    PermissionCreateFormInput,
    PermissionUpdateFormInput,
} from "../types";
import { DeletePermissionDialog } from "./delete-permission-dialog";
import { PermissionFormDialog } from "./permission-form-dialog";
import { getPermissionColumns } from "./permissions-table-columns";

interface PermissionsTableProps {
    accessPermissions: AccessPermissionRow[];
}

export function PermissionsTable({ accessPermissions }: PermissionsTableProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingPermission, setEditingPermission] = useState<AccessPermissionRow | null>(null);
    const [deletingPermission, setDeletingPermission] = useState<AccessPermissionRow | null>(null);

    const columns = useMemo(() => {
        return getPermissionColumns({
            onEdit: setEditingPermission,
            onDelete: setDeletingPermission,
        });
    }, []);

    function handleCreatePermission(input: PermissionCreateFormInput) {
        startTransition(async () => {
            const response = await createPermissionAction(input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setCreateDialogOpen(false);
        });
    }

    function handleUpdatePermission(input: PermissionUpdateFormInput) {
        if (!editingPermission) {
            return;
        }

        startTransition(async () => {
            const response = await updatePermissionAction(editingPermission.id, input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setEditingPermission(null);
        });
    }

    function handleDeletePermission() {
        if (!deletingPermission) {
            return;
        }

        startTransition(async () => {
            const response = await deletePermissionAction(deletingPermission.id);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setDeletingPermission(null);
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
                            New permission
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search user or room" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={accessPermissions}
                        meta={null}
                        loading={false}
                        onPageChange={() => {
                            return undefined;
                        }}
                        empty={
                            <EmptyState
                                icon={Activity}
                                title="No permissions found"
                                description="Create a permission or adjust the current filters."
                            />
                        }
                    />
                </CardContent>
            </Card>

            <PermissionFormDialog
                mode="create"
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreatePermission}
            />

            <PermissionFormDialog
                mode="edit"
                open={editingPermission !== null}
                permission={editingPermission}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingPermission(null);
                    }
                }}
                onSubmit={handleUpdatePermission}
            />

            <DeletePermissionDialog
                open={deletingPermission !== null}
                permission={deletingPermission}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingPermission(null);
                    }
                }}
                onConfirm={handleDeletePermission}
            />
        </>
    );
}
