"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/common/status-badge";

import { formatAccessLogRoom, formatAccessLogUser, formatDate } from "../format";
import type { AccessLogResultRow } from "../types";

export function getAccessLogResultColumns(): ColumnDef<AccessLogResultRow>[] {
    return [
        {
            accessorKey: "result",
            header: "Result",
            cell: ({ row }) => {
                return <StatusBadge value={row.original.result} />;
            },
        },
        {
            accessorKey: "accessRequest.userId",
            header: "User",
            cell: ({ row }) => {
                return formatAccessLogUser(row.original.accessRequest);
            },
        },
        {
            accessorKey: "accessRequest.roomId",
            header: "Room",
            cell: ({ row }) => {
                return formatAccessLogRoom(row.original.accessRequest);
            },
        },
        {
            accessorKey: "accessRequest.cardId",
            header: "Card",
            cell: ({ row }) => {
                return row.original.accessRequest.card.code;
            },
        },
        {
            accessorKey: "completedAt",
            header: "Completed",
            cell: ({ row }) => {
                return formatDate(row.original.completedAt);
            },
        },
    ];
}
