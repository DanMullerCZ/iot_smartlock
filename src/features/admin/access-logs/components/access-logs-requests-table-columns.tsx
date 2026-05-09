"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/common/status-badge";

import { formatAccessLogRoom, formatAccessLogUser, formatDate, getRequestResult } from "../format";
import type { AccessLogRequestRow } from "../types";

export function getAccessLogRequestColumns(): ColumnDef<AccessLogRequestRow>[] {
    return [
        {
            accessorKey: "userId",
            header: "User",
            cell: ({ row }) => {
                return formatAccessLogUser(row.original);
            },
        },
        {
            accessorKey: "roomId",
            header: "Room",
            cell: ({ row }) => {
                return formatAccessLogRoom(row.original);
            },
        },
        {
            accessorKey: "cardId",
            header: "Card",
            cell: ({ row }) => {
                return row.original.card.code;
            },
        },
        {
            id: "result",
            header: "Result",
            cell: ({ row }) => {
                return <StatusBadge value={getRequestResult(row.original)} />;
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
