"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/common/status-badge";

import { formatDashboardUser, formatDate, getDashboardRequestResult } from "../format";
import type { DashboardAccessRequest } from "../types";

export function getRecentAccessActivityColumns(): ColumnDef<DashboardAccessRequest>[] {
    return [
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => {
                return formatDashboardUser(row.original);
            },
        },
        {
            accessorKey: "room.name",
            header: "Room",
            cell: ({ row }) => {
                return row.original.room.name;
            },
        },
        {
            accessorKey: "card.code",
            header: "Card",
            cell: ({ row }) => {
                return row.original.card.code;
            },
        },
        {
            id: "result",
            header: "Result",
            cell: ({ row }) => {
                return <StatusBadge value={getDashboardRequestResult(row.original)} />;
            },
        },
        {
            accessorKey: "requestedAt",
            header: "Requested",
            cell: ({ row }) => {
                return formatDate(row.original.requestedAt);
            },
        },
    ];
}
