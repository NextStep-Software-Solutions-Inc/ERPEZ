import { CheckCircle, Clock } from "lucide-react"
import { Card, CardContent } from "~/components/ui/card"
import { buildActivities } from "~/data/overview/activityActions"

import { useTenant } from "~/providers/TenantProvider"
import { planLabel } from "~/lib/tenant"

function OverviewRecentActivity({ planName: planProp }: { planName?: string }) {
    const { tenant } = useTenant();
    const planName = planProp || planLabel(tenant?.tenantSubscription?.plan);
    const activities = buildActivities(planName, {
        startDate: tenant?.tenantSubscription?.startDate,
        isDisabled: tenant?.isDisabled,
        tenantName: tenant?.name,
    });

    return (
        <div className="pt-8">
            <h2 className="text-lg font-semibold mb-4">Workspace Summary</h2>
            <Card>
                <CardContent className="divide-y">
                    {activities.length === 0 ? (
                        <div className="py-4 text-sm text-muted-foreground text-center">No recent activity</div>
                    ) : (
                        activities.map((a) => (
                            <div key={a.id} className="flex justify-between items-center py-3">
                                <div className="flex items-center gap-3">
                                    {a.type === "success" ? (
                                        <CheckCircle className="h-5 w-5 text-green-500" />
                                    ) : (
                                        <Clock className="h-5 w-5 text-blue-500" />
                                    )}
                                    <div>
                                        <p className="font-medium">{a.title}</p>
                                        <p className="text-sm text-muted-foreground">{a.message}</p>
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">{a.time}</span>
                            </div>
                        ))
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default OverviewRecentActivity