"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/misc/empty-state";
import { StatusBadge } from "@/components/misc/status-badge";
import type { AdminRoomRow } from "@/lib/server/admin-rooms";

interface UsersTableProps {
    rooms: AdminRoomRow[];
}

function formatDate(value: string | null | undefined) {
    if (!value) {
        return "—";
    }

    return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
    }).format(new Date(value));
}

export function RoomsTable({ rooms }: UsersTableProps) {
    const columns = useMemo(() => {
        return [
            {
                header: "Name",
                cell: ({ row }: { row: { original: AdminRoomRow } }) => {
                    return row.original.name;
                },
            },
            {
                header: "Location",
                cell: ({ row }: { row: { original: AdminRoomRow } }) => {
                    return row.original.location;
                },
            },
            {
                header: "Description",
                cell: ({ row }: { row: { original: AdminRoomRow } }) => {
                    return row.original.description;
                },
            },
            {
                header: "Status",
                cell: ({ row }: { row: { original: AdminRoomRow } }) => {
                    return <StatusBadge value={row.original.status as never} />;
                },
            },
            {
                header: "Created",
                cell: ({ row }: { row: { original: AdminRoomRow } }) => {
                    return formatDate(row.original.createdAt);
                },
            },
        ];
    }, []);

    return (
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
                    title="No users found"
                    description="Create an account or adjust the current filters."
                />
            }
        />
    );
}
