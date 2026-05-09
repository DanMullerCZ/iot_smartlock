"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/misc/empty-state";
import { StatusBadge } from "@/components/misc/status-badge";
import type { AdminPermissionRow } from "@/lib/server/admin-permissions";

interface PermissionsTableProps {
    accessPermissions: AdminPermissionRow[];
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

export function PermissionsTable({ accessPermissions }: PermissionsTableProps) {
    const columns = useMemo(() => {
        return [
            {
                header: "User",
                cell: ({ row }: { row: { original: AdminPermissionRow } }) => {
                    return row.original.userId;
                },
            },
            {
                header: "Room",
                cell: ({ row }: { row: { original: AdminPermissionRow } }) => {
                    return row.original.roomId;
                },
            },
            {
                header: "Status",
                cell: ({ row }: { row: { original: AdminPermissionRow } }) => {
                    return <StatusBadge value={row.original.status as never} />;
                },
            },
            {
                header: "Valid from",
                cell: ({ row }: { row: { original: AdminPermissionRow } }) => {
                    return formatDate(row.original.from);
                },
            },
            {
                header: "Valid to",
                cell: ({ row }: { row: { original: AdminPermissionRow } }) => {
                    return formatDate(row.original.to);
                },
            },
        ];
    }, []);

    return (
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
    );
}
