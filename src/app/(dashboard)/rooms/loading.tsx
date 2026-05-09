import { PageHeader } from "@/components/misc/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";

export default function UsersLoading() {
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
                            <InputGroupInput placeholder="Search rooms" disabled />

                            <InputGroupAddon>
                                <Spinner />
                            </InputGroupAddon>
                        </InputGroup>

                        <Skeleton className="h-80 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
