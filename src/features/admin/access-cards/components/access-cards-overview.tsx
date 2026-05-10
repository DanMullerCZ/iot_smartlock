import { PageHeader } from "@/components/common/page-header";

import type { AccessCardsOverview } from "../types";
import { AccessCardsTable } from "./access-cards-table";

interface AccessCardsOverviewProps {
    data: AccessCardsOverview;
}

export function AccessCardsOverview({ data }: AccessCardsOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Access Cards"
                    description="Assign and monitor RFID cards used by SmartLock devices."
                />

                <AccessCardsTable accessCards={data.accessCards} />
            </div>
        </div>
    );
}
