"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { StatusBadge } from "@/components/common/status-badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatAccessCardOwner, formatDate } from "../format";
import type { AccessCardRow } from "../types";

interface AccessCardColumnsOptions {
    onEdit: (accessCard: AccessCardRow) => void;
    onDelete: (accessCard: AccessCardRow) => void;
}

export function getAccessCardColumns({
    onEdit,
    onDelete,
}: AccessCardColumnsOptions): ColumnDef<AccessCardRow>[] {
    return [
        { accessorKey: "code", header: "RFID Code" },
        { accessorKey: "type", header: "Type" },
        {
            accessorKey: "userId",
            header: "Owner",
            cell: ({ row }) => {
                return formatAccessCardOwner(row.original);
            },
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                return <StatusBadge value={row.original.status} />;
            },
        },
        {
            accessorKey: "assignedAt",
            header: "Assigned",
            cell: ({ row }) => {
                return formatDate(row.original.assignedAt);
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const accessCard = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                aria-label={`Open actions for ${accessCard.code}`}
                            >
                                <Settings2 />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onEdit(accessCard);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onDelete(accessCard);
                                    }}
                                >
                                    Delete
                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];
}
