import { Search } from "lucide-react";

import { PageHeader } from "@/components/misc/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import type { AdminPermissionsOverview } from "@/lib/server/admin-permissions";

import { PermissionsTable } from "./permissions-table";

interface PermissionsOverviewProps {
    data: AdminPermissionsOverview;
}

export function PermissionsOverview({ data }: PermissionsOverviewProps) {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Permissions"
                    description="Control which users can enter which rooms and when."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Directory</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <InputGroup>
                            <InputGroupInput placeholder="Search user or room" />

                            <InputGroupAddon>
                                <Search />
                            </InputGroupAddon>
                        </InputGroup>

                        <PermissionsTable accessPermissions={data.accessPermissions} />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
