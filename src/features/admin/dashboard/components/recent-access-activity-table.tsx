"use client";

import { Activity } from "lucide-react";
import { useMemo } from "react";

import { DataTable } from "@/components/common/data-table";
import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardAccessRequest, DashboardPaginationMeta } from "../types";
import { getRecentAccessActivityColumns } from "./recent-access-activity-table-columns";

interface RecentAccessActivityTableProps {
    requests: DashboardAccessRequest[];
    meta: DashboardPaginationMeta;
}

export function RecentAccessActivityTable({ requests, meta }: RecentAccessActivityTableProps) {
    const columns = useMemo(() => {
        return getRecentAccessActivityColumns();
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
