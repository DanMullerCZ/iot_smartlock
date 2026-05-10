import { PageHeader } from "@/components/common/page-header";

import type { DashboardOverviewData } from "../types";
import { DashboardMetricGrid } from "./dashboard-metric-grid";
import { RecentAccessActivityTable } from "./recent-access-activity-table";

interface DashboardOverviewProps {
    data: DashboardOverviewData;
}

export function DashboardOverview({ data }: DashboardOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Dashboard"
                    description="A quick view of SmartLock access-control health and recent activity."
                />

                <DashboardMetricGrid metrics={data.metrics} />

                <RecentAccessActivityTable requests={data.requests} meta={data.meta} />
            </div>
        </div>
    );
}
