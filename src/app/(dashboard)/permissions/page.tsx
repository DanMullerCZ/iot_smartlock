import { PermissionsOverview } from "@/features/admin/permissions/components/permissions-overview";
import { getPermissionsOverview } from "@/features/admin/permissions/queries";

export default async function PermissionsPage() {
    const data = await getPermissionsOverview();

    return <PermissionsOverview data={data} />;
}
