import { Search } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { AdminRoomsOverview } from "@/lib/server/admin-rooms";

import { RoomsTable } from "./rooms-table";

interface RoomsOverviewProps {
    data: AdminRoomsOverview;
}

export function RoomsOverview({ data }: RoomsOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Rooms"
                    description="Track protected rooms, locations, and room availability."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Directory</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <InputGroup>
                            <InputGroupInput placeholder="Search rooms" />

                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>

                        <RoomsTable rooms={data.rooms} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
