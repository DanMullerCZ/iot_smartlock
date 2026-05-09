export type MetricIconKey = "users" | "rooms" | "cards" | "permissions" | "activity";

export type AccessResultValue = "OK" | "GENERIC_ERROR" | "DENIED" | "TIMEOUT";

export interface DashboardMetric {
    label: string;
    value: string;
    help: string;
    icon: MetricIconKey;
}

export interface DashboardAccessRequest {
    id: string;
    requestedAt: string;
    user: {
        name: string;
        email: string;
    };
    room: {
        name: string;
    };
    card: {
        code: string;
    };
    accessResult: {
        result: AccessResultValue;
        completedAt: string;
    } | null;
}

export interface DashboardPaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface DashboardOverviewData {
    metrics: DashboardMetric[];
    requests: DashboardAccessRequest[];
    meta: DashboardPaginationMeta;
}
