import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Skeleton } from "~/components/ui/skeleton";

export const TenantOverviewSkeleton = () => {
    const recentActivities = Array.from({ length: Math.floor(Math.random() * 3) + 3 }); // 3–5

    return (
        <div className="space-y-8">
            {/* Top cards */}
            <Skeleton className="h-8 w-52 mb-4" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i} className="flex flex-col gap-5">
                        <CardHeader className="flex flex-row justify-between items-center">
                            <CardTitle className="text-sm font-medium">
                                <Skeleton className="h-4 w-24" />
                            </CardTitle>
                            <Skeleton className="h-5 w-5 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-16 mb-2" />
                            <Skeleton className="h-3 w-32" />
                            <div className="mt-3">
                                <Skeleton className="h-8 w-24 rounded-md" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Quick actions */}
            <div className="pt-8">
                <Skeleton className="h-6 w-32 mb-4" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i}>
                            <CardContent className="flex flex-col items-center justify-center gap-4 py-6">
                                <Skeleton className="h-10 w-10 rounded-sm" />
                                <div className="flex flex-col items-center justify-center text-center space-y-2">
                                    <Skeleton className="h-4 w-28" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                                <Skeleton className="h-8 w-24 rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Recent Activity placeholder */}
            <div className="pt-8">
                <Skeleton className="h-6 w-40 mb-3" />
                <div className="space-y-3">
                    {recentActivities.map((_, i) => (
                        <Skeleton key={i} className="h-10 w-full rounded-md" />
                    ))}
                </div>
            </div>
        </div>
    );
};

