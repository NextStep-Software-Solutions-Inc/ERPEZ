import { motion } from "framer-motion"
import { MoreVertical, Plus } from "lucide-react"
import { Button } from "./ui/button"
import { Skeleton } from "./ui/skeleton"
import type { OPCRActivity, PAPDepartment } from "./features/planning/opcrActivity/types"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { itemVariants } from "@/utils/animation"

export function OPCRActivityHeader({ hasActivities, activitiesCount, openCreateDialog }: { hasActivities: boolean, activitiesCount: number, openCreateDialog: () => void }) {
    return (
        <div className="flex items-center justify-between">
            <div>
                <h3 className="font-semibold text-lg">Activities</h3>
                <p className="text-sm text-muted-foreground">
                    {hasActivities
                        ? `${activitiesCount} activity item${activitiesCount !== 1 ? 's' : ''}`
                        : 'No activities defined'}
                </p>
            </div>
            <div>
                <Button onClick={openCreateDialog} className="bg-blue-500 hover:bg-blue-600 text-white">
                    <Plus /> Add Activity
                </Button>
            </div>
        </div>
    )
}

export function LoadingSkeleton() {
    return (
        <div className="space-y-2">
            <Skeleton className="h-4 w-48 mb-3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
        </div>
    )
}

export function ActivityCardContent({ activity }: { activity: OPCRActivity }) {
    return (
        <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-1">
                <h5 className="font-semibold text-sm">
                    {activity.name}
                </h5>
            </div>
            {activity.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {activity.description}
                </p>
            )}
        </div>
    )
}

export function ActivityActionsPopover({
    activity,
    setEditingActivity,
    openEditDialog,
    setDeletingActivity,
    openDeleteDialog
}: {
    activity: OPCRActivity,
    setEditingActivity: (activity: OPCRActivity) => void,
    openEditDialog: () => void,
    setDeletingActivity: (activity: OPCRActivity) => void,
    openDeleteDialog: () => void
}) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 hover:bg-muted"
                    aria-label="Activity actions"
                    onPointerDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                >
                    <MoreVertical className="h-3 w-3" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-40 p-2">
                <div className="flex flex-col gap-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start"
                        onClick={(e) => {
                            e.stopPropagation()
                            setEditingActivity(activity)
                            openEditDialog()
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                            e.stopPropagation()
                            setDeletingActivity(activity)
                            openDeleteDialog()
                        }}
                    >
                        Delete
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export function DepartmentItem({ dept }: { dept: PAPDepartment }) {
    return (
        <motion.div
            variants={itemVariants}
            className="border rounded-md p-3 bg-white/50 hover:bg-white/70 transition-colors"
        >
            <p className="text-sm font-medium">
                {dept.deliveryUnit.office.name || 'Unknown Office'}
            </p>
        </motion.div>
    )
}
