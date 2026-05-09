import { Activity, Building2, CreditCard, ShieldAlert, Users, type LucideIcon } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecentAccessActivityTable } from "@/features/admin/dashboard/components/recent-access-activity-table";
import type { DashboardOverviewData, MetricIconKey } from "@/lib/admin/dashboard-types";

const metricIcons: Record<MetricIconKey, LucideIcon> = {
    users: Users,
    rooms: Building2,
    cards: CreditCard,
    permissions: ShieldAlert,
    activity: Activity,
};

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

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {data.metrics.map((metric) => {
                        const Icon = metricIcons[metric.icon];

                        return (
                            <Card key={metric.label}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">
                                        {metric.label}
                                    </CardTitle>

                                    <CardAction>
                                        <Icon className="h-4 w-4 text-muted-foreground" />
                                    </CardAction>
                                </CardHeader>

                                <CardContent>
                                    <div className="text-2xl font-semibold">{metric.value}</div>

                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {metric.help}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <RecentAccessActivityTable requests={data.requests} meta={data.meta} />
            </div>
        </div>
    );
}
