import { PageHeader } from "@/components/common/page-header";

import type { LocksOverview } from "../types";
import { LocksTable } from "./locks-table";

interface LocksOverviewProps {
    data: LocksOverview;
}

export function LocksOverview({ data }: LocksOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Locks"
                    description="Manage room lock devices and room assignments."
                />

                <LocksTable locks={data.locks} roomOptions={data.roomOptions} />
            </div>
        </div>
    );
}
