"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";

import type { AccessLogRequestRow } from "../types";
import { getAccessLogRequestColumns } from "./access-logs-requests-table-columns";

interface AccessLogsRequestsTableProps {
    requests: AccessLogRequestRow[];
}

export function AccessLogsRequestsTable({ requests }: AccessLogsRequestsTableProps) {
    const columns = useMemo(() => {
        return getAccessLogRequestColumns();
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
                    title="No access requests"
                    description="Device requests will appear here."
                />
            }
        />
    );
}
