import { Activity, Building2, CreditCard, ShieldAlert, Users, type LucideIcon } from "lucide-react";

import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { DashboardMetric, MetricIconKey } from "../types";

const metricIcons: Record<MetricIconKey, LucideIcon> = {
    users: Users,
    rooms: Building2,
    cards: CreditCard,
    permissions: ShieldAlert,
    activity: Activity,
};

interface DashboardMetricCardProps {
    metric: DashboardMetric;
}

export function DashboardMetricCard({ metric }: DashboardMetricCardProps) {
    const Icon = metricIcons[metric.icon];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
                <CardAction>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                </CardAction>
            </CardHeader>

            <CardContent>
                <div className="text-2xl font-semibold">{metric.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{metric.help}</p>
            </CardContent>
        </Card>
    );
}
