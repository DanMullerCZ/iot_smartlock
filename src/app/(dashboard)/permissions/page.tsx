import { PermissionsOverview } from "@/components/features/admin/permissions/components/permissions-overview";
import { getPermissionsOverview } from "@/lib/server/admin-permissions";

export default async function PermissionsPage() {
    const data = await getPermissionsOverview();

    return <PermissionsOverview data={data} />;
}
