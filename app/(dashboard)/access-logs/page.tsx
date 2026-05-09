import { AccessLogsOverview } from "@/components/features/admin/access-logs/components/access-logs-overview";
import { getAccessLogsOverview } from "@/lib/server/admin-access-logs";

export default async function AccessLogsPage() {
    const data = await getAccessLogsOverview();

    return <AccessLogsOverview data={data} />;
}
