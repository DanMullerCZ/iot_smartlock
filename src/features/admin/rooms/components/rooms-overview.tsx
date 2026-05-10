import { PageHeader } from "@/components/common/page-header";

import type { RoomsOverview } from "../types";
import { RoomsTable } from "./rooms-table";

interface RoomsOverviewProps {
    data: RoomsOverview;
}

export function RoomsOverview({ data }: RoomsOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Rooms"
                    description="Track protected rooms, locations, and room availability."
                />

                <RoomsTable rooms={data.rooms} />
            </div>
        </div>
    );
}
