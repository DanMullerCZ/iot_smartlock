import { AccessLogsOverview } from "@/features/admin/access-logs/components/access-logs-overview";
import { getAccessLogsOverview } from "@/features/admin/access-logs/queries";

export default async function AccessLogsPage() {
    const data = await getAccessLogsOverview();

    return <AccessLogsOverview data={data} />;
}
