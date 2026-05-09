import { DashboardOverview } from "@/features/admin/dashboard/components/dashboard-overview";
import { getDashboardOverview } from "@/features/admin/dashboard/queries";

export default async function DashboardPage() {
    const data = await getDashboardOverview();

    return <DashboardOverview data={data} />;
}
