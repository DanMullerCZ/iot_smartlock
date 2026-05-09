import type { DashboardMetric } from "../types";
import { DashboardMetricCard } from "./dashboard-metric-card";

interface DashboardMetricGridProps {
    metrics: DashboardMetric[];
}

export function DashboardMetricGrid({ metrics }: DashboardMetricGridProps) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            {metrics.map((metric) => {
                return <DashboardMetricCard key={metric.label} metric={metric} />;
            })}
        </div>
    );
}
