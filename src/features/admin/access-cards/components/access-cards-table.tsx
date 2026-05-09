"use client";

import { Activity, Search } from "lucide-react";
import { startTransition, useMemo, useState } from "react";
import { toast } from "sonner";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";

import { createAccessCardAction, deleteAccessCardAction, updateAccessCardAction } from "../actions";
import type { AccessCardFormInput, AccessCardRow } from "../types";
import { AccessCardFormDialog } from "./access-card-form-dialog";
import { getAccessCardColumns } from "./access-cards-table-columns";
import { DeleteAccessCardDialog } from "./delete-access-card-dialog";

interface AccessCardsTableProps {
    accessCards: AccessCardRow[];
}

export function AccessCardsTable({ accessCards }: AccessCardsTableProps) {
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editingAccessCard, setEditingAccessCard] = useState<AccessCardRow | null>(null);
    const [deletingAccessCard, setDeletingAccessCard] = useState<AccessCardRow | null>(null);

    const columns = useMemo(() => {
        return getAccessCardColumns({
            onEdit: setEditingAccessCard,
            onDelete: setDeletingAccessCard,
        });
    }, []);

    function handleCreateAccessCard(input: AccessCardFormInput) {
        startTransition(async () => {
            const response = await createAccessCardAction(input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setCreateDialogOpen(false);
        });
    }

    function handleUpdateAccessCard(input: AccessCardFormInput) {
        if (!editingAccessCard) {
            return;
        }

        startTransition(async () => {
            const response = await updateAccessCardAction(editingAccessCard.id, input);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setEditingAccessCard(null);
        });
    }

    function handleDeleteAccessCard() {
        if (!deletingAccessCard) {
            return;
        }

        startTransition(async () => {
            const response = await deleteAccessCardAction(deletingAccessCard.id);

            if (!response.success) {
                toast.error(response.message);
                return;
            }

            toast.success(response.message);
            setDeletingAccessCard(null);
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
                            New card
                        </Button>
                    </CardAction>
                </CardHeader>

                <CardContent className="space-y-4">
                    <InputGroup>
                        <InputGroupInput placeholder="Search card code or owner" />
                        <InputGroupAddon>
                            <Search />
                        </InputGroupAddon>
                    </InputGroup>

                    <DataTable
                        columns={columns}
                        data={accessCards}
                        meta={null}
                        loading={false}
                        onPageChange={() => {
                            return undefined;
                        }}
                        empty={
                            <EmptyState
                                icon={Activity}
                                title="No cards found"
                                description="Register an RFID card or adjust the current filters."
                            />
                        }
                    />
                </CardContent>
            </Card>

            <AccessCardFormDialog
                mode="create"
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
                onSubmit={handleCreateAccessCard}
            />

            <AccessCardFormDialog
                mode="edit"
                open={editingAccessCard !== null}
                accessCard={editingAccessCard}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingAccessCard(null);
                    }
                }}
                onSubmit={handleUpdateAccessCard}
            />

            <DeleteAccessCardDialog
                open={deletingAccessCard !== null}
                accessCard={deletingAccessCard}
                onOpenChange={(open) => {
                    if (!open) {
                        setDeletingAccessCard(null);
                    }
                }}
                onConfirm={handleDeleteAccessCard}
            />
        </>
    );
}
