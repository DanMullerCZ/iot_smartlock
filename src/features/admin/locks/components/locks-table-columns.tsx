"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Settings2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatDate, formatLockName, formatRoomLabel } from "../format";
import type { LockRow } from "../types";

interface LockColumnsOptions {
    onEdit: (lock: LockRow) => void;
    onDelete: (lock: LockRow) => void;
}

export function getLockColumns({ onEdit, onDelete }: LockColumnsOptions): ColumnDef<LockRow>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                return formatLockName(row.original);
            },
        },
        {
            accessorKey: "room",
            header: "Room",
            cell: ({ row }) => {
                return formatRoomLabel(row.original.room);
            },
        },
        {
            accessorKey: "description",
            header: "Description",
            cell: ({ row }) => {
                return row.original.description ?? "—";
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                return formatDate(row.original.createdAt);
            },
        },
        {
            id: "actions",
            header: "",
            cell: ({ row }) => {
                const lock = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                aria-label={`Open actions for ${formatLockName(lock)}`}
                            >
                                <Settings2 />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onEdit(lock);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onDelete(lock);
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
