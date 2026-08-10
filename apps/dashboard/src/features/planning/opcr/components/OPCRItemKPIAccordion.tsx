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
import { ArrowRight, Eye, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
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
  const navigation = useNavigate({ from: '/v2/commitments' })
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
                      'border-2 rounded-lg px-4 border-l-4 border-l-blue-500 border-blue-200 bg-white transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:bg-blue-50/30',
                    )}
                  >
                    <AccordionTrigger className="hover:no-underline flex-row-reverse justify-end py-4">
                      <div className="flex items-start justify-between w-full pl-4">
                        <div className="flex-1 text-left">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg text-gray-900">
                              {opcrItem?.kpiAssignment?.fyActiveKPI?.name ||
                                'Unnamed KPI'}
                            </h3>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {opcrItem?.kpiAssignment?.fyActiveKPI?.code}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {opcrItem?.kpiAssignment?.fyActiveKPI
                            ?.functionCategory && (
                            <Badge
                              className="text-xs font-semibold bg-blue-100 text-blue-800 hover:bg-blue-100"
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
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                                title="More actions"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-4 h-4 text-blue-600" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-56 p-0" align="end">
                              <div className="flex flex-col">
                                {KPI_ACTIONS.map((action) => {
                                  const IconComponent = action.icon
                                  return (
                                    <Button
                                      key={action.id}
                                      variant="ghost"
                                      className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors border-b last:border-b-0 justify-start"
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
                                      <IconComponent className="w-4 h-4 text-gray-600" />
                                      <span className="font-medium text-gray-900">
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
                      <div className="space-y-6 pt-6 pl-4 border-l-2 border-blue-200">
                        {/* Assigned Targets Grid (KPI Assignment Level) */}
                        <div className="space-y-4">
                          <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                            Assigned Targets
                          </h4>
                          <div className="grid grid-cols-5 gap-2.5">
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
                                    'p-3 rounded-lg border-2 transition-all duration-300 text-center',
                                    isAnnual
                                      ? 'border-blue-300 bg-linear-to-b from-blue-50 to-blue-100/50'
                                      : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/20',
                                  )}
                                >
                                  <p
                                    className={`text-xs font-bold mb-1.5 uppercase tracking-wider ${
                                      isAnnual
                                        ? 'text-blue-700'
                                        : 'text-gray-600'
                                    }`}
                                  >
                                    {quarter.label}
                                  </p>
                                  <p
                                    className={`text-base font-bold ${
                                      isAnnual
                                        ? 'text-blue-700'
                                        : 'text-gray-900'
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
                          <div className="border-t pt-4">
                            <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-2">
                              Description
                            </h4>
                            <p className="text-sm text-gray-600">
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
                              className="space-y-3 border-t pt-4"
                            >
                              <label className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                                Activities
                              </label>
                              <div className="space-y-2">
                                {opcrItem.opcrActivities.map(
                                  (activity: OPCRActivity) => (
                                    <div
                                      key={activity.id}
                                      className="border border-blue-200 rounded-lg p-3 bg-blue-50/40 hover:bg-blue-50/60 hover:border-blue-300 transition-all duration-300"
                                    >
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="flex-1">
                                          <p className="font-semibold text-sm text-gray-900">
                                            {activity.name}
                                          </p>
                                          {activity.description && (
                                            <p className="text-xs text-gray-600 mt-1.5">
                                              {activity.description}
                                            </p>
                                          )}
                                          {activity.budget && (
                                            <p className="text-xs text-blue-600 font-semibold mt-2">
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
                                              className="h-8 w-8 p-0 hover:bg-blue-100 shrink-0"
                                              title="Activity actions"
                                              onClick={(e) =>
                                                e.stopPropagation()
                                              }
                                            >
                                              <MoreHorizontal className="w-4 h-4 text-blue-600" />
                                            </Button>
                                          </PopoverTrigger>
                                          <PopoverContent
                                            className="w-56 p-0"
                                            align="end"
                                          >
                                            <div className="flex flex-col">
                                              {ACTIVITY_ACTIONS.map(
                                                (action) => {
                                                  const IconComponent =
                                                    action.icon
                                                  return (
                                                    <Button
                                                      key={action.id}
                                                      variant="ghost"
                                                      className={`flex items-center gap-3 px-4 py-2 text-sm transition-colors border-b last:border-b-0 justify-start ${
                                                        action.id === 'delete'
                                                          ? 'text-red-600 hover:bg-red-50'
                                                          : 'text-gray-700 hover:bg-gray-100'
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
                                                            ? 'text-red-600'
                                                            : 'text-gray-600'
                                                        }`}
                                                      />
                                                      <span
                                                        className={`font-medium ${
                                                          action.id === 'delete'
                                                            ? 'text-red-600'
                                                            : 'text-gray-900'
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
    label: 'Add Activity',
    icon: ArrowRight,
    description: 'Create new activity',
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
