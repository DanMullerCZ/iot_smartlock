"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import type { AdminAccessCardRow } from "@/lib/server/admin-access-cards";

interface AccessCardsTableProps {
    accessCards: AdminAccessCardRow[];
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

export function AccessCardsTable({ accessCards }: AccessCardsTableProps) {
    const columns = useMemo(() => {
        return [
            {
                header: "RFID Code",
                cell: ({ row }: { row: { original: AdminAccessCardRow } }) => {
                    return row.original.code;
                },
            },
            {
                header: "Type",
                cell: ({ row }: { row: { original: AdminAccessCardRow } }) => {
                    return row.original.type;
                },
            },
            {
                header: "Owner",
                cell: ({ row }: { row: { original: AdminAccessCardRow } }) => {
                    return row.original.userId;
                },
            },
            {
                header: "Status",
                cell: ({ row }: { row: { original: AdminAccessCardRow } }) => {
                    return <StatusBadge value={row.original.status as never} />;
                },
            },
            {
                header: "Assigned",
                cell: ({ row }: { row: { original: AdminAccessCardRow } }) => {
                    return formatDate(row.original.assignedAt);
                },
            },
        ];
    }, []);

    return (
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
    );
}
