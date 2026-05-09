"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import type { AdminAccessLogsRequestRow } from "@/lib/server/admin-access-logs";

interface AccessLogsRequestsTableProps {
    requests: AdminAccessLogsRequestRow[];
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

export function AccessLogsRequestsTable({ requests }: AccessLogsRequestsTableProps) {
    const columns = useMemo(() => {
        return [
            {
                header: "User",
                cell: ({ row }: { row: { original: AdminAccessLogsRequestRow } }) => {
                    return `${row.original.user.name} · ${row.original.user.email}`;
                },
            },
            {
                header: "Room",
                cell: ({ row }: { row: { original: AdminAccessLogsRequestRow } }) => {
                    return row.original.room.name;
                },
            },
            {
                header: "Card",
                cell: ({ row }: { row: { original: AdminAccessLogsRequestRow } }) => {
                    return row.original.card.code;
                },
            },
            {
                header: "Result",
                cell: ({ row }: { row: { original: AdminAccessLogsRequestRow } }) => {
                    return row.original.accessResult ? (
                        <StatusBadge value={row.original.accessResult.result} />
                    ) : (
                        <StatusBadge value="TIMEOUT" />
                    );
                },
            },
            {
                header: "Requested",
                cell: ({ row }: { row: { original: AdminAccessLogsRequestRow } }) => {
                    return formatDate(row.original.requestedAt);
                },
            },
        ];
    }, []);

    return (
        <DataTable
            columns={columns}
            data={requests}
            meta={null}
            loading={false}
            onPageChange={() => {
                return undefined;
            }}
            empty={
                <EmptyState
                    icon={Activity}
                    title="No access request"
                    description="Device requests will appear here."
                />
            }
        />
    );
}
