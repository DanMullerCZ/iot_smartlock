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

import { formatDate, formatPermissionRoom, formatPermissionUser } from "../format";
import type { AccessPermissionRow } from "../types";

interface PermissionColumnsOptions {
    onEdit: (permission: AccessPermissionRow) => void;
    onDelete: (permission: AccessPermissionRow) => void;
}

export function getPermissionColumns({
    onEdit,
    onDelete,
}: PermissionColumnsOptions): ColumnDef<AccessPermissionRow>[] {
    return [
        {
            accessorKey: "userId",
            header: "User",
            cell: ({ row }) => {
                return formatPermissionUser(row.original);
            },
        },
        {
            accessorKey: "roomId",
            header: "Room",
            cell: ({ row }) => {
                return formatPermissionRoom(row.original);
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
            accessorKey: "from",
            header: "Valid from",
            cell: ({ row }) => {
                return formatDate(row.original.from);
            },
        },
        {
            accessorKey: "to",
            header: "Valid to",
            cell: ({ row }) => {
                return formatDate(row.original.to);
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const permission = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                aria-label={`Open actions for permission ${permission.id.toString()}`}
                            >
                                <Settings2 />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onEdit(permission);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onDelete(permission);
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
