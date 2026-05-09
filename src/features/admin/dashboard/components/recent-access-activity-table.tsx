"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/admin/data-table";
import { EmptyState } from "@/components/misc/empty-state";
import { StatusBadge } from "@/components/misc/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardAccessRequest, DashboardPaginationMeta } from "@/lib/admin/dashboard-types";

interface RecentAccessActivityTableProps {
    requests: DashboardAccessRequest[];
    meta: DashboardPaginationMeta;
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

export function RecentAccessActivityTable({ requests, meta }: RecentAccessActivityTableProps) {
    const columns = useMemo(() => {
        return [
            {
                header: "User",
                cell: ({ row }: { row: { original: DashboardAccessRequest } }) => {
                    return `${row.original.user.name} · ${row.original.user.email}`;
                },
            },
            {
                header: "Room",
                cell: ({ row }: { row: { original: DashboardAccessRequest } }) => {
                    return row.original.room.name;
                },
            },
            {
                header: "Card",
                cell: ({ row }: { row: { original: DashboardAccessRequest } }) => {
                    return row.original.card.code;
                },
            },
            {
                header: "Result",
                cell: ({ row }: { row: { original: DashboardAccessRequest } }) => {
                    if (!row.original.accessResult) {
                        return <StatusBadge value="TIMEOUT" />;
                    }

                    return <StatusBadge value={row.original.accessResult.result} />;
                },
            },
            {
                header: "Requested",
                cell: ({ row }: { row: { original: DashboardAccessRequest } }) => {
                    return formatDate(row.original.requestedAt);
                },
            },
        ];
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Access Activity</CardTitle>
            </CardHeader>

            <CardContent>
                <DataTable
                    columns={columns}
                    data={requests}
                    meta={meta}
                    loading={false}
                    onPageChange={() => {
                        return undefined;
                    }}
                    empty={
                        <EmptyState
                            icon={Activity}
                            title="No access activity"
                            description="Access requests will appear here once devices start reporting events."
                        />
                    }
                />
            </CardContent>
        </Card>
    );
}
