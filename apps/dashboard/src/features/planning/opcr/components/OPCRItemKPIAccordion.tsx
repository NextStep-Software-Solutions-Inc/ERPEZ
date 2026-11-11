import {
  createMutationHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { OPCRActivity, OPCRItem } from '../types'
import { createOPCRActivityRequest } from '@/components/features/planning/opcrActivity/handlers/createOPCRActivityRequest'
import { deleteOPCRActivityRequest } from '@/components/features/planning/opcrActivity/handlers/deleteOPCRActivityRequest'
import { updateOPCRActivityRequest } from '@/components/features/planning/opcrActivity/handlers/updateOPCRActivityRequest'
import { useState } from 'react'
// import { CreateActivityFormValues } from '@/features/planning/opcr/dialogs/CreateOPCRActivityForm'
import { toast } from 'sonner'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { motion } from 'framer-motion'
import { cardVariants } from '@/utils/animation'
import { cn } from '@/lib/utils'
// import { CreateActivityDialog } from '@/features/planning/opcr/dialogs/CreateOPCRActivityDialog'
import { Eye, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useNavigate, useSearch } from '@tanstack/react-router'
import { OPCRKPIDetails } from './OPCRKPIDetails'
import { OPCRActivityDetails } from './OPCRActivityDetails'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { UpdateOPCRActivityDialog } from '@/features/planning/opcr/dialogs/UpdateOPCRActivityDialog'
import { CreateOPCRActivityFormValues } from '../dialogs/CreateOPCRActivityForm'
import { CreateOPCRActivityDialog } from '../dialogs/CreateOPCRActivityDialog'
import { UpdateKPITargetDialog } from '@/features/planning/opcr/dialogs/UpdateKPITargetDialog'
import { updateKPIAssignmentRequest } from '@/components/features/planning/kpi-assignment-for-du/handlers/updateKpiAssignmentRequest'
import { UpdateKPITargetFormValues } from '../dialogs/UpdateKPITargetForm'

interface OPCRItemKPIAccordionProps {
  filteredKPIs: OPCRItem[]
  expandedAccordionItems: string[]
  setExpandedAccordionItems: (items: string[]) => void
  createActivityDialogOpen: boolean
  setCreateActivityDialogOpen: (open: boolean) => void
  selectedKPIForActivity: OPCRItem | null
  setSelectedKPIForActivity: (kpi: OPCRItem | null) => void
  getQuarterlyTargets: (opcrItem: OPCRItem) => Record<string, number>
  officeId?: string
}

const useCreateOPCRActivity = createMutationHookFromTemplate(
  createOPCRActivityRequest,
)
const useDeleteOPCRActivity = createMutationHookFromTemplate(
  deleteOPCRActivityRequest,
)
const useUpdateOPCRActivity = createMutationHookFromTemplate(
  updateOPCRActivityRequest,
)
const useUpdateKPIAssignment = createMutationHookFromTemplate(
  updateKPIAssignmentRequest,
)
export default function OPCRItemKPIAccordion({
  filteredKPIs,
  expandedAccordionItems,
  setExpandedAccordionItems,
  createActivityDialogOpen,
  setCreateActivityDialogOpen,
  selectedKPIForActivity,
  setSelectedKPIForActivity,
  officeId,
}: OPCRItemKPIAccordionProps) {
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null)
  const [openActivityPopoverId, setOpenActivityPopoverId] = useState<
    string | null
  >(null)
  const [updateActivityDialogOpen, setUpdateActivityDialogOpen] =
    useState<boolean>(false)
  const [selectedActivityForUpdate, setSelectedActivityForUpdate] =
    useState<OPCRActivity | null>(null)
  const [updateKPITargetDialogOpen, setUpdateKPITargetDialogOpen] =
    useState<boolean>(false)
  const [selectedKPIForTargetUpdate, setSelectedKPIForTargetUpdate] =
    useState<OPCRItem | null>(null)
  const { mutateAsync } = useCreateOPCRActivity()
  const { mutateAsync: deleteAsync } = useDeleteOPCRActivity()
  const { mutateAsync: updateAsync } = useUpdateOPCRActivity()
  const { mutateAsync: updateKPIAsync } = useUpdateKPIAssignment()
  const queryClient = useQueryClient()
  const navigation = useNavigate({ from: '/v2/commitments/' })
  const searchParams = useSearch({ from: '/v2/commitments/' })
  const handleCreateOPCRActivity = async (
    values: CreateOPCRActivityFormValues,
  ) => {
    toast.promise(
      mutateAsync(
        {
          pathParams: {},
          payload: {
            opcrItemId: selectedKPIForActivity?.id || '',
            name: values.name,
            description: values.description,
            budget: values.budget,
            PAPDepartmentIds: values.PAPDepartmentIds,
          },
        },
        {
          onSuccess: async () => {
            // Invalidate the current OPCR query to refetch with new activity
            // Uses URL-based predicate pattern to match all OPCR detail queries
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/opcrs/'),
            })
            setCreateActivityDialogOpen(false)
            setSelectedKPIForActivity(null)
          },
        },
      ),
    )
  }
  const handleDeleteActivity = async (activityId: string) => {
    toast.promise(
      deleteAsync(
        {
          pathParams: { id: activityId },
        },
        {
          onSuccess: async () => {
            // Invalidate the current OPCR query to refetch with updated activities
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/opcrs/'),
            })
          },
        },
      ),
    )
  }
  const handleUpdateActivity = async (values: Record<string, any>) => {
    if (!selectedActivityForUpdate?.id) return
    toast.promise(
      updateAsync(
        {
          pathParams: { id: selectedActivityForUpdate.id },
          payload: {
            opcrItemId: selectedActivityForUpdate.opcrId,
            budget: values.budget,
            description: values.description,
            name: values.name,
            PAPDepartmentIds: values.PAPDepartmentIds,
          },
          queryParams: {},
        },
        {
          onSuccess: async () => {
            // Invalidate the current OPCR query to refetch with updated activity
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/opcrs/'),
            })
            setUpdateActivityDialogOpen(false)
            setSelectedActivityForUpdate(null)
          },
        },
      ),
    )
  }
  const handleUpdateKPITarget = async (values: UpdateKPITargetFormValues) => {
    if (!selectedKPIForTargetUpdate?.kpiAssignment?.id) return
    toast.promise(
      updateKPIAsync(
        {
          pathParams: { id: selectedKPIForTargetUpdate.kpiAssignment.id },
          payload: {
            assignedTargetQ1: values.assignedTargetQ1,
            assignedTargetQ2: values.assignedTargetQ2,
            assignedTargetQ3: values.assignedTargetQ3,
            assignedTargetQ4: values.assignedTargetQ4,
            assignedTargetAnnual: values.assignedTargetAnnual,
            isLocked: values.isLocked,
          },
          queryParams: {},
        },
        {
          onSuccess: async () => {
            // Invalidate the current OPCR query to refetch with updated KPI targets
            await queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                query.queryKey[0].startsWith('/opcrs/'),
            })
            setUpdateKPITargetDialogOpen(false)
            setSelectedKPIForTargetUpdate(null)
          },
        },
      ),
    )
  }
  const { kpiAssignmentId, opcrActivityId } = searchParams

  // Helper function to find selected activity and its parent KPI from filtered KPIs
  const getSelectedActivityWithKPI = (): {
    activity: OPCRActivity
    opcrItem: OPCRItem
  } | null => {
    if (!opcrActivityId) return null
    for (const kpi of filteredKPIs) {
      const found = kpi.opcrActivities?.find((a) => a.id === opcrActivityId)
      if (found) return { activity: found, opcrItem: kpi }
    }
    return null
  }
  const selectedActivityData = getSelectedActivityWithKPI()

  return (
    <>
      {kpiAssignmentId ? (
        <>
          <OPCRKPIDetails kpiAssignmentId={kpiAssignmentId} hideButton />
        </>
      ) : opcrActivityId && selectedActivityData ? (
        <>
          <OPCRActivityDetails
            activity={selectedActivityData.activity}
            kpiAssignment={selectedActivityData.opcrItem.kpiAssignment}
            onBack={() => {
              navigation({
                search: {
                  ...searchParams,
                  opcrActivityId: undefined,
                },
              })
            }}
          />
        </>
      ) : (
        <>
          <Accordion
            type="single"
            collapsible
            className="space-y-4"
            value={expandedAccordionItems[0] || ''}
            onValueChange={(value) => {
              setExpandedAccordionItems(value ? [value] : [])
            }}
          >
            {filteredKPIs.map((opcrItem, index) => {
              return (
                <motion.div
                  key={opcrItem.id}
                  initial="hidden"
                  animate="show"
                  variants={cardVariants}
                >
                  <AccordionItem
                    value={`kpi-${index}`}
                    className={cn(
                      'border rounded-xl px-5 border-l-4 border-l-blue-500 border-blue-200/80 dark:border-slate-700/80 bg-card dark:bg-slate-900/65 transition-all duration-200 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/20 dark:hover:bg-slate-800/75',
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline flex-row-reverse justify-end py-4">
                      <div className="flex items-start justify-between w-full pl-4 gap-4">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-1.5">
                            <h3 className="font-bold text-lg text-foreground leading-snug">
                              {opcrItem?.kpiAssignment?.fyActiveKPI?.name ||
                                'Unnamed KPI'}
                            </h3>
                          </div>
                          <p className="text-xs font-mono text-muted-foreground">
                            {opcrItem?.kpiAssignment?.fyActiveKPI?.code}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {opcrItem?.kpiAssignment?.fyActiveKPI
                            ?.functionCategory && (
                              <Badge
                                className="text-xs font-semibold bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/35 hover:bg-blue-100 dark:hover:bg-blue-500/25"
                                variant="outline"
                              >
                                {
                                  opcrItem.kpiAssignment.fyActiveKPI
                                    .functionCategory
                                }
                              </Badge>
                            )}
                          {/* KPI Actions Popover */}
                          <Popover
                            open={openPopoverId === opcrItem.id}
                            onOpenChange={(open) => {
                              setOpenPopoverId(open ? opcrItem.id : null)
                            }}
                          >
                            <PopoverTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/15"
                                title="More actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-0" align="end">
                              <div className="flex flex-col divide-y divide-border">
                                {KPI_ACTIONS.map((action) => {
                                  const IconComponent = action.icon
                                  return (
                                    <Button
                                      key={action.id}
                                      variant="ghost"
                                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors rounded-none justify-start"
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenPopoverId(null)
                                        if (action.id === 'view-details') {
                                          //   setViewingKPI(opcrItem)
                                          navigation({
                                            search: {
                                              ...searchParams,
                                              kpiAssignmentId:
                                                opcrItem.kpiAssignment?.id ||
                                                '',
                                            },
                                          })
                                        } else if (
                                          action.id === 'edit-target'
                                        ) {
                                          setSelectedKPIForTargetUpdate(
                                            opcrItem,
                                          )
                                          setUpdateKPITargetDialogOpen(true)
                                        } else if (
                                          action.id === 'add-activity'
                                        ) {
                                          setSelectedKPIForActivity(opcrItem)
                                          setCreateActivityDialogOpen(true)
                                        }
                                      }}
                                    >
                                      <IconComponent className="w-4 h-4 text-muted-foreground" />
                                      <span className="font-medium text-foreground">
                                        {action.label}
                                      </span>
                                    </Button>
                                  )
                                })}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>
                    </AccordionTrigger>

                    <AccordionContent>
                      <div className="space-y-6 pt-4 pl-4 border-l-2 border-blue-200 dark:border-blue-500/30">
                        {/* Assigned Targets Grid (KPI Assignment Level) */}
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                            Assigned Targets
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                            {(() => {
                              const q1 =
                                opcrItem?.kpiAssignment?.assignedTargetQ1 || 0
                              const q2 =
                                opcrItem?.kpiAssignment?.assignedTargetQ2 || 0
                              const q3 =
                                opcrItem?.kpiAssignment?.assignedTargetQ3 || 0
                              const q4 =
                                opcrItem?.kpiAssignment?.assignedTargetQ4 || 0
                              const annual =
                                opcrItem?.kpiAssignment?.assignedTargetAnnual ||
                                0
                              return [
                                { label: 'Q1', value: q1 },
                                { label: 'Q2', value: q2 },
                                { label: 'Q3', value: q3 },
                                { label: 'Q4', value: q4 },
                                {
                                  label: 'Annual Target',
                                  value: annual,
                                  isAnnual: true,
                                },
                              ]
                            })().map((quarter) => {
                              const isAnnual = quarter.isAnnual
                              return (
                                <div
                                  key={quarter.label}
                                  className={cn(
                                    'p-3 rounded-lg border transition-all duration-200 text-center',
                                    isAnnual
                                      ? 'border-blue-300 dark:border-blue-500/40 bg-linear-to-b from-blue-50 to-blue-100/50 dark:from-blue-500/15 dark:to-blue-500/5'
                                      : 'border-border bg-muted/30 dark:bg-slate-800/50 hover:border-blue-300 dark:hover:border-blue-500/40',
                                  )}
                                >
                                  <p
                                    className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
                                      isAnnual
                                        ? 'text-blue-700 dark:text-blue-300'
                                        : 'text-muted-foreground'
                                    }`}
                                  >
                                    {quarter.label}
                                  </p>
                                  <p
                                    className={`text-base font-bold tabular-nums ${
                                      isAnnual
                                        ? 'text-blue-700 dark:text-blue-200'
                                        : 'text-foreground'
                                    }`}
                                  >
                                    {quarter.value?.toLocaleString() || 0}
                                  </p>
                                </div>
                              )
                            })}
                          </div>
                        </div>

                        {/* KPI Description */}
                        {opcrItem?.kpiAssignment?.fyActiveKPI?.description && (
                          <div className="border-t border-border pt-4">
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-foreground/85 leading-relaxed">
                              {opcrItem.kpiAssignment.fyActiveKPI.description}
                            </p>
                          </div>
                        )}

                        {/* Activities List */}
                        {opcrItem.opcrActivities &&
                          opcrItem.opcrActivities.length > 0 && (
                            <motion.div
                              initial="hidden"
                              animate="show"
                              variants={cardVariants}
                              className="space-y-3 border-t border-border pt-4"
                            >
                              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                                Activities
                              </label>
                              <div className="space-y-2.5">
                                {opcrItem.opcrActivities.map(
                                  (activity: OPCRActivity) => (
                                    <div
                                      key={activity.id}
                                      className="border border-blue-200/80 dark:border-blue-500/25 rounded-lg p-3.5 bg-blue-50/40 dark:bg-slate-800/60 hover:bg-blue-50/60 dark:hover:bg-slate-800/90 hover:border-blue-300 dark:hover:border-blue-500/45 transition-all duration-200"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <p className="font-semibold text-sm text-foreground">
                                            {activity.name}
                                          </p>
                                          {activity.description && (
                                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                                              {activity.description}
                                            </p>
                                          )}
                                          {activity.budget && (
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold mt-2 tabular-nums">
                                              Budget: ₱{activity.budget}
                                              {/* {activity.budget.toLocaleString()} */}
                                            </p>
                                          )}
                                        </div>
                                        <Popover
                                          open={
                                            openActivityPopoverId ===
                                            activity.id
                                          }
                                          onOpenChange={(open) => {
                                            setOpenActivityPopoverId(
                                              open ? activity.id || null : null,
                                            )
                                          }}
                                        >
                                          <PopoverTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/15 shrink-0"
                                              title="Activity actions"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            className="w-56 p-0"
                                            align="end"
                                          >
                                            <div className="flex flex-col divide-y divide-border">
                                              {ACTIVITY_ACTIONS.map(
                                                (action) => {
                                                  const IconComponent =
                                                    action.icon
                                                  return (
                                                    <Button
                                                      key={action.id}
                                                      variant="ghost"
                                                      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded-none justify-start ${
                                                        action.id === 'delete'
                                                          ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/15'
                                                          : 'text-foreground hover:bg-muted'
                                                      }`}
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        setOpenActivityPopoverId(
                                                          null,
                                                        )
                                                        if (
                                                          action.id ===
                                                          'view-details'
                                                        ) {
                                                          navigation({
                                                            search: {
                                                              ...searchParams,
                                                              opcrActivityId:
                                                                activity.id,
                                                            },
                                                          })
                                                        } else if (
                                                          action.id === 'edit'
                                                        ) {
                                                          setSelectedActivityForUpdate(
                                                            activity,
                                                          )
                                                          setUpdateActivityDialogOpen(
                                                            true,
                                                          )
                                                        } else if (
                                                          action.id === 'delete'
                                                        ) {
                                                          if (activity.id) {
                                                            handleDeleteActivity(
                                                              activity.id,
                                                            )
                                                          }
                                                        }
                                                      }}
                                                    >
                                                      <IconComponent
                                                        className={`w-4 h-4 ${
                                                          action.id === 'delete'
                                                            ? 'text-rose-600 dark:text-rose-400'
                                                            : 'text-muted-foreground'
                                                        }`}
                                                      />
                                                      <span
                                                        className={`font-medium ${
                                                          action.id === 'delete'
                                                            ? 'text-rose-600 dark:text-rose-400'
                                                            : 'text-foreground'
                                                        }`}
                                                      >
                                                        {action.label}
                                                      </span>
                                                    </Button>
                                                  )
                                                },
                                              )}
                                            </div>
                                          </PopoverContent>
                                        </Popover>
                                      </div>
                                    </div>
                                  ),
                                )}
                              </div>
                            </motion.div>
                          )}

                        {/* No Activities Message */}
                        {(!opcrItem.opcrActivities ||
                          opcrItem.opcrActivities.length === 0) && (
                            <div className="text-center py-6 border-t">
                              <p className="text-sm text-muted-foreground">
                                No activities assigned to this KPI
                              </p>
                            </div>
                          )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </motion.div>
              )
            })}
          </Accordion>
        </>
      )}

      {/* Create OPCR Activity Dialog */}
      <CreateOPCRActivityDialog
        isOpen={createActivityDialogOpen}
        onOpenChange={setCreateActivityDialogOpen}
        officeId={officeId}
        defaultKpi={
          selectedKPIForActivity?.kpiAssignment?.fyActiveKPI?.name || ''
        }
        defaultDimension=""
        defaultSubKpiId={
          selectedKPIForActivity?.kpiAssignment?.fyActiveKPIId || ''
        }
        onActivityCreated={handleCreateOPCRActivity}
        triggerClassName="hidden"
        triggerVariant="ghost"
        triggerSize="sm"
      />

      {/* Update OPCR Activity Dialog */}
      {selectedActivityForUpdate && (
        <UpdateOPCRActivityDialog
          activity={selectedActivityForUpdate}
          officeId={officeId}
          isOpen={updateActivityDialogOpen}
          onOpenChange={setUpdateActivityDialogOpen}
          onActivityUpdated={handleUpdateActivity}
          triggerClassName="hidden"
          triggerVariant="ghost"
          triggerSize="sm"
        />
      )}

      {/* Update KPI Target Dialog */}
      {selectedKPIForTargetUpdate && (
        <UpdateKPITargetDialog
          opcrItem={selectedKPIForTargetUpdate}
          isOpen={updateKPITargetDialogOpen}
          onOpenChange={setUpdateKPITargetDialogOpen}
          onTargetsUpdated={handleUpdateKPITarget}
          triggerClassName="hidden"
          triggerVariant="ghost"
          triggerSize="sm"
        />
      )}
    </>
  )
}

// KPI Actions Configuration
export const KPI_ACTIONS = [
  {
    id: 'view-details',
    label: 'View Details',
    icon: Eye,
    description: 'View KPI details and information',
  },
  {
    id: 'edit-target',
    label: 'Edit Target',
    icon: Pencil,
    description: 'Edit quarterly targets',
  },
  {
    id: 'add-activity',
    label: 'Add Activity Indicator',
    icon: Plus,
    description: 'Create new activity indicator',
  },
]

// Activity Actions Configuration
export const ACTIVITY_ACTIONS = [
  {
    id: 'view-details',
    label: 'View Details',
    icon: Eye,
    description: 'View activity details',
  },
  {
    id: 'edit',
    label: 'Edit',
    icon: Pencil,
    description: 'Edit activity information',
  },
  {
    id: 'delete',
    label: 'Delete',
    icon: Trash2,
    description: 'Delete this activity',
  },
]
