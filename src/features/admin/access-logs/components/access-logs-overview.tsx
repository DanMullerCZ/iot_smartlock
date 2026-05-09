import { PageHeader } from "@/components/common/page-header";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import type { AdminAccessLogsOverview } from "@/lib/server/admin-access-logs";

import { AccessLogsTabContent } from "./access-logs-tab-content";

interface AccessLogsProps {
    data: AdminAccessLogsOverview;
}

export function AccessLogsOverview({ data }: AccessLogsProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Access Logs"
                    description="Read-only audit history for access requests and completed controller results."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Trail</CardTitle>
                    </CardHeader>

                    <AccessLogsTabContent requests={data.requests} results={data.results} />
                </Card>
            </div>
        </div>
    );
}
