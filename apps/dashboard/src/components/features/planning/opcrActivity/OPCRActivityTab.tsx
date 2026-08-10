import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useSetAtom } from 'jotai'
import { FileX } from 'lucide-react'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { useParams } from '@tanstack/react-router'
import CreateOPCRActivityDialog from './dialogs/CreateOPCRActivityDialog'
import EditOPCRActivityDialog from './dialogs/EditOPCRActivityDialog'
import DeleteOPCRActivityDialog from './dialogs/DeleteOPCRActivityDialog'
import {
    deletingActivityAtom,
    editingActivityAtom,
    openCreateDialogAtom,
    openDeleteDialogAtom,
    openEditDialogAtom,
} from './atoms/dialogAtoms'
import { getOPCRActivitiesRequest } from './handlers/getOPCRActivitiesRequest'
import { cardHoverVariants, cardVariants, containerVariants, itemVariants } from '@/utils/animation'
import { Badge } from '@/components/ui/badge'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion'
import { TabsContent } from '@/components/ui/tabs'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import { formatCurrencyPHP } from '@/utils/formatters'
import { cn } from '@/lib/utils'
import { ActivityActionsPopover, ActivityCardContent, DepartmentItem, LoadingSkeleton, OPCRActivityHeader } from '@/components/OPCRActivityHeader'
import { Separator } from '@/components/ui/separator'

const useOPCRActivities = createQueryHookFromTemplate(getOPCRActivitiesRequest)

interface OPCRActivityTabProps {
    kpiId: string
    prefersReducedMotion?: boolean
}

export function OPCRActivityTab({
    prefersReducedMotion = false,
}: OPCRActivityTabProps) {
    const [prefersReducedMotionLocal, setPrefersReducedMotionLocal] = useState(
        prefersReducedMotion,
    )
    const { opcrId } = useParams({ from: '/planning/$deliveryUnitId/opcr/$opcrId/kpi/$functionType/$kpiId/' })
    const openCreateDialog = useSetAtom(openCreateDialogAtom)
    const openEditDialog = useSetAtom(openEditDialogAtom)
    const openDeleteDialog = useSetAtom(openDeleteDialogAtom)
    const setEditingActivity = useSetAtom(editingActivityAtom)
    const setDeletingActivity = useSetAtom(deletingActivityAtom)

    const { data: activitiesData, isLoading } = useOPCRActivities({
        pathParams: {},
        queryParams: {
            pageNumber: 1,
            pageSize: 999,
            filters: `opcrId==${opcrId}`,
        },
    })

    const activities = activitiesData?.data || []
    const hasActivities = activities.length > 0

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
        setPrefersReducedMotionLocal(mediaQuery.matches)

        const handler = (e: MediaQueryListEvent) =>
            setPrefersReducedMotionLocal(e.matches)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    return (
        <>
            <TabsContent value="activity" forceMount className="mt-0">
                <div className="space-y-4">
                    <OPCRActivityHeader
                        hasActivities={hasActivities}
                        activitiesCount={activities.length}
                        openCreateDialog={openCreateDialog}
                    />
                    {isLoading ? (
                        <LoadingSkeleton />
                    ) : hasActivities ? (
                        <motion.div
                            initial={prefersReducedMotionLocal ? 'show' : 'hidden'}
                            animate="show"
                            variants={containerVariants}
                            className="space-y-2"
                        >
                            <Accordion type="single" collapsible className="space-y-2">
                                {activities.map((activity) => {
                                    const hasPAPDepartments =
                                        Array.isArray(activity.PAPDepartments) &&
                                        activity.PAPDepartments.length > 0
                                    if (hasPAPDepartments) { 
                                        return (
                                            <motion.div
                                                key={activity.id}
                                                variants={itemVariants}
                                                initial={prefersReducedMotionLocal ? 'show' : 'hidden'}
                                                animate="show"
                                            >
                                                <motion.div
                                                    initial={prefersReducedMotionLocal ? 'show' : 'hidden'}
                                                    animate="show"
                                                    variants={cardVariants}
                                                    whileHover={
                                                        prefersReducedMotionLocal ? {} : cardHoverVariants.hover
                                                    }
                                                >
                                                    <AccordionItem
                                                        value={`activity-${activity.id}`}
                                                        className={cn(
                                                            'border rounded-lg px-4 bg-muted/30',
                                                            'border-l-4 border-l-blue-500',
                                                        )}
                                                    >
                                                        <AccordionTrigger className="hover:no-underline py-3 flex-row-reverse">
                                                            <div className="flex items-start justify-between w-full pr-4">
                                                                <ActivityCardContent activity={activity} />
                                                                <div className="flex items-center gap-2 ml-4">
                                                                    {hasPAPDepartments && (
                                                                        <Badge className="bg-blue-500 hover:bg-blue-600 text-xs">
                                                                            {activity.PAPDepartments.length} Dept
                                                                            {activity.PAPDepartments.length !== 1 ? 's' : ''}
                                                                        </Badge>
                                                                    )}
                                                                    <Badge variant="outline" className="text-xs">
                                                                        {formatCurrencyPHP(activity.budget)}
                                                                    </Badge>
                                                                    <ActivityActionsPopover
                                                                        activity={activity}
                                                                        setEditingActivity={setEditingActivity}
                                                                        openEditDialog={openEditDialog}
                                                                        setDeletingActivity={setDeletingActivity}
                                                                        openDeleteDialog={openDeleteDialog}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <Separator />
                                                        <AccordionContent className="pt-4 pb-3">
                                                            <motion.div
                                                                initial={prefersReducedMotionLocal ? 'show' : 'hidden'}
                                                                animate="show"
                                                                variants={containerVariants}
                                                                className="space-y-2 pl-4"
                                                            >
                                                                <p className="font-semibold">Responsible Sub-DU</p>
                                                                {(() => {
                                                                    const chunkedDepartments = []
                                                                    for (let i = 0; i < activity.PAPDepartments.length; i += 8) {
                                                                        chunkedDepartments.push(activity.PAPDepartments.slice(i, i + 8))
                                                                    }
                                                                    return (
                                                                        <div className="relative px-12">
                                                                            <Carousel className="w-full">
                                                                                <CarouselContent>
                                                                                    {chunkedDepartments.map((chunk, index) => (
                                                                                        <CarouselItem key={index}>
                                                                                            <div className="grid grid-cols-4 grid-rows-2 gap-2">
                                                                                                {chunk.map((dept) => (
                                                                                                    <DepartmentItem key={dept.id} dept={dept} />
                                                                                                ))}
                                                                                            </div>
                                                                                        </CarouselItem>
                                                                                    ))}
                                                                                </CarouselContent>
                                                                                {chunkedDepartments.length > 1 && <CarouselPrevious />}
                                                                                {chunkedDepartments.length > 1 && <CarouselNext />}
                                                                            </Carousel>
                                                                        </div>
                                                                    )
                                                                })()}
                                                            </motion.div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                </motion.div>
                                            </motion.div>
                                        )
                                    } else {
                                        return (
                                            <motion.div
                                                key={activity.id}
                                                variants={itemVariants}
                                                whileHover={
                                                    prefersReducedMotionLocal ? {} : { scale: 1.01, y: -2 }
                                                }
                                                className="border rounded-md p-3 bg-muted/30 hover:bg-muted/50 transition-colors border-l-4 border-l-blue-500"
                                            >
                                                <div className="flex items-start justify-between gap-2">
                                                    <ActivityCardContent activity={activity} />
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="outline" className="text-xs">
                                                            {formatCurrencyPHP(activity.budget)}
                                                        </Badge>
                                                        <ActivityActionsPopover
                                                            activity={activity}
                                                            setEditingActivity={setEditingActivity}
                                                            openEditDialog={openEditDialog}
                                                            setDeletingActivity={setDeletingActivity}
                                                            openDeleteDialog={openDeleteDialog}
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )
                                    }
                                })}
                            </Accordion>
                        </motion.div>
                        ) : (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <FileX className="h-12 w-12 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-medium text-muted-foreground mb-2">No Activities Yet</h3>
                                    <p className="text-sm text-muted-foreground">No activities have been defined for this KPI.</p>
                                </div>
                    )}
                </div>
            </TabsContent>
            <CreateOPCRActivityDialog />
            <EditOPCRActivityDialog />
            <DeleteOPCRActivityDialog />
        </>
    )
}
export default OPCRActivityTab
