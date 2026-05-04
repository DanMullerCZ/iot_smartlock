import { DashboardOverview } from "@/components/admin/DashboardOverview";
import { getDashboardOverview } from "@/lib/server/admin-dashboard";

export default async function DashboardPage() {
    const data = await getDashboardOverview();

    return <DashboardOverview data={data} />;
}
