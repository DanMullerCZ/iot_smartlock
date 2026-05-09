import { DashboardOverview } from "@/components/features/admin/dashboard/components/dashboard-overview";
import { getDashboardOverview } from "@/lib/server/admin-dashboard";

export default async function DashboardPage() {
    const data = await getDashboardOverview();

    return <DashboardOverview data={data} />;
}
