"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";

import type { AccessLogResultRow } from "../types";
import { getAccessLogResultColumns } from "./access-logs-results-table-columns";

interface AccessLogsResultsTableProps {
    results: AccessLogResultRow[];
}

export function AccessLogsResultsTable({ results }: AccessLogsResultsTableProps) {
    const columns = useMemo(() => {
        return getAccessLogResultColumns();
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
