import { LocksOverview } from "@/features/admin/locks/components/locks-overview";
import { getLocksOverview } from "@/features/admin/locks/queries";

export default async function LocksPage() {
    const data = await getLocksOverview();

    return <LocksOverview data={data} />;
}
