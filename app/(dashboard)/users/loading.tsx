import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="space-y-6">
                <div className="flex flex-col gap-3">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-4 w-96  max-w-full" />
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => {
                        return (
                            <Card key={index}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle>
                                        <Skeleton className="h-4 w-24 rounded-md bg-muted" />
                                    </CardTitle>

                                    <CardAction>
                                        <Skeleton className="h-4 w-4" />
                                    </CardAction>
                                </CardHeader>

                                <CardContent>
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-3 w-32 mt-1" />
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                <Card className="w-full h-96">
                    <CardHeader>
                        <Skeleton className="h-4 w-40" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-80 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
