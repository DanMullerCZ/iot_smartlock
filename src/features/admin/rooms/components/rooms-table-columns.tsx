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

import { formatDate } from "../format";
import type { RoomRow } from "../types";

interface RoomColumnsOptions {
    onEdit: (room: RoomRow) => void;
    onDelete: (room: RoomRow) => void;
}

export function getRoomColumns({ onEdit, onDelete }: RoomColumnsOptions): ColumnDef<RoomRow>[] {
    return [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "location",
            header: "Location",
            cell: ({ row }) => {
                return row.original.location ?? "—";
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
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                return <StatusBadge value={row.original.status} />;
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
                const room = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" aria-label={`Open actions for ${room.name}`}>
                                <Settings2 />
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onEdit(room);
                                    }}
                                >
                                    Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() => {
                                        onDelete(room);
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
