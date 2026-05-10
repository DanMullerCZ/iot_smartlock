import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export default function AccessLogsLoading() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <PageHeader
                    title="Access Logs"
                    description="Read-only audit history for access requests and completed controller results."
                />

                <Card>
                    <CardHeader>
                        <CardTitle>Audit Trail</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <div className="inline-flex w-full space-x-4">
                            <InputGroup>
                                <InputGroupInput placeholder="Search user, room or card" disabled />

                                <InputGroupAddon>
                                    <Spinner />
                                </InputGroupAddon>
                            </InputGroup>

                            <Select disabled>
                                <SelectTrigger className="w-1/4">
                                    <SelectValue placeholder="All result" />
                                </SelectTrigger>
                            </Select>
                        </div>

                        <Skeleton className="h-80 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
