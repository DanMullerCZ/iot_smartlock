import { PageHeader } from "@/components/common/page-header";

import type { PermissionsOverview } from "../types";
import { PermissionsTable } from "./permissions-table";

interface PermissionsOverviewProps {
    data: PermissionsOverview;
}

export function PermissionsOverview({ data }: PermissionsOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Permissions"
                    description="Control which users can enter which rooms and when."
                />

                <PermissionsTable accessPermissions={data.accessPermissions} />
            </div>
        </div>
    );
}
