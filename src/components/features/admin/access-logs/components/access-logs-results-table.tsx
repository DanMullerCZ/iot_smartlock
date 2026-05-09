"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/misc/empty-state";
import { StatusBadge } from "@/components/misc/status-badge";
import type { AdminAccessLogsResultRow } from "@/lib/server/admin-access-logs";

interface AccessLogsResultsTableProps {
    results: AdminAccessLogsResultRow[];
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

export function AccessLogsResultsTable({ results }: AccessLogsResultsTableProps) {
    const columns = useMemo(() => {
        return [
            {
                header: "Result",
                cell: ({ row }: { row: { original: AdminAccessLogsResultRow } }) => {
                    return <StatusBadge value={row.original.result} />;
                },
            },
            {
                header: "User",
                cell: ({ row }: { row: { original: AdminAccessLogsResultRow } }) => {
                    return `${row.original.accessRequest.user.name} · ${row.original.accessRequest.user.email}`;
                },
            },
            {
                header: "Room",
                cell: ({ row }: { row: { original: AdminAccessLogsResultRow } }) => {
                    return row.original.accessRequest.room.name;
                },
            },
            {
                header: "Card",
                cell: ({ row }: { row: { original: AdminAccessLogsResultRow } }) => {
                    return row.original.accessRequest.card.code;
                },
            },
            {
                header: "Completed",
                cell: ({ row }: { row: { original: AdminAccessLogsResultRow } }) => {
                    return formatDate(row.original.completedAt);
                },
            },
        ];
    }, []);

    return (
        <DataTable
            columns={columns}
            data={results}
            meta={null}
            loading={false}
            onPageChange={() => {
                return undefined;
            }}
            empty={
                <EmptyState
                    icon={Activity}
                    title="No access results"
                    description="Completed controller responses will appear here."
                />
            }
        />
    );
}
