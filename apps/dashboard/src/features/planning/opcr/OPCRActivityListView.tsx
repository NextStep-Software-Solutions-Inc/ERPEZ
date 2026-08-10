import { motion } from 'framer-motion'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { Trash2, Edit } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { getOPCRActivitiesRequest } from '@/components/features/planning/opcrActivity/handlers/getOPCRActivitiesRequest'
import { containerVariants, itemVariants } from '@/utils/animation'
import { formatCurrencyPHP } from '@/utils/formatters'

const useOPCRActivities = createQueryHookFromTemplate(getOPCRActivitiesRequest)

interface OPCRActivityListViewProps {
    kpiId: string
    opcrId: string
    deliveryUnitId: string
    selectedQuarter: string
}

export function OPCRActivityListView({
    kpiId,
    opcrId,
    selectedQuarter,
}: OPCRActivityListViewProps) {
    const { data: activitiesData, isLoading } = useOPCRActivities({
        pathParams: {},
        queryParams: {
            pageNumber: 1,
            pageSize: 999,
            filters: `opcrId==${opcrId}`,
        },
    })

    const activities = activitiesData?.data || []
    const activityQuarter = selectedQuarter === 'Annual Target' ? 'Annual' : selectedQuarter
    const filteredActivities = activities.filter((activity: any) => {
        const matchesKpi = !activity.kpiId || activity.kpiId === kpiId
        const matchesQuarter =
            !activity.quarterName ||
            activity.quarterName === activityQuarter ||
            (activityQuarter === 'Annual' && activity.period === 'Annual')

        return matchesKpi && matchesQuarter
    })
    const hasActivities = filteredActivities.length > 0

    if (isLoading) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        )
    }

    if (!hasActivities) {
        return (
            <div className="text-center py-6 text-muted-foreground text-sm">
                No activities defined
            </div>
        )
    }

    return (
        <motion.div
            initial="hidden"
            animate="show"
            variants={containerVariants}
            className="space-y-2"
        >
            <p className="text-sm font-semibold text-muted-foreground">Activities</p>
            <div className="space-y-2">
                {filteredActivities.map((activity: any) => (
                    <motion.div
                        key={activity.id}
                        variants={itemVariants}
                        className="border rounded-lg p-3 bg-blue-50/30 hover:bg-blue-50/50 transition-colors"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <p className="font-medium text-sm">{activity.name}</p>
                                {activity.description && (
                                    <p className="text-xs text-muted-foreground mt-1">{activity.description}</p>
                                )}
                                <div className="flex items-center gap-2 mt-2">
                                    <Badge variant="outline" className="text-xs">
                                        {formatCurrencyPHP(activity.budget)}
                                    </Badge>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    title="Edit activity"
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                    title="Delete activity"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    )
}
