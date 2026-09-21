import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createMutationHookFromTemplate,
  createQueryHookFromTemplate,
  useQueryClient,
} from 'erpez-shared-lib'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { createLineItemBudgetDetailsRequest } from '../handlers/createLineItemBudgetDetailsRequest'
import FieldInfo from '@/components/FieldInfo'
import { getObjectsRequest } from '@/features/planning/object/handlers/getObjectsRequest'
import { getLIBRequest } from '../../line-item-budget/handlers/getLIBRequest'
import { getWFPRequest } from '@/components/features/planning/wfp/wfp/handlers/getWFPRequest'
import { Button } from '@/components/ui/button'
import { Trash2, Check, Plus, Loader2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import {
  generateProjectPeriods,
  formatDateToISO,
} from '../utils/periodAllocationHelpers'
import {
  resolveExpenditureTypes,
  getDescendantExpenditureItems,
} from '../utils/expenditureHierarchyHelpers'
import type { WFPDetails } from '@/components/features/planning/wfp/wfp/table/types'

const useGetObjects = createQueryHookFromTemplate(getObjectsRequest)
const useGetLIB = createQueryHookFromTemplate(getLIBRequest)
const useGetWFP = createQueryHookFromTemplate(getWFPRequest)


// Validation schema aligned with API nullable fields
const createLineItemBudgetDetailsSchema = z.object({
  objectId: z.string().min(1, 'Type of Expenditure is required'),
  itemOfExpenditureId: z.string().optional(),
  wfpObjectiveActivityExpenditureId: z.string().optional(),
  description: z.string().optional().or(z.string().min(1)),
  unitQuantity: z.number().optional(),
  unitCost: z.number().optional(),
  timelineType: z.string().min(1, 'Timeline Type is required'),
})

export type CreateWfpLineItemBudgetDetailsFormValues = z.infer<
  typeof createLineItemBudgetDetailsSchema
>

// Type for line items in the table with temp ID for editing/deletion
export interface LineItemWithId {
  _tempId: string
  objectId: string
  itemOfExpenditureId?: string
  wfpObjectiveActivityExpenditureId?: string
  description?: string
  unitQuantity?: number
  unitCost?: number
  startDate: string
  endDate: string
  timelineType: string
  budget: number
  periodKey?: string
  periodLabel?: string
  dateRangeLabel?: string
  resolvedName?: string
  resolvedCode?: string
}

interface LineItemBudgetDetailsDefaults {
  objectId: string
  itemOfExpenditureId?: string
  description?: string
  wfpObjectiveActivityExpenditureId?: string
  unitQuantity?: number
  unitCost?: number
  timelineType: string
}

// Helper to extract the form type
const useLineItemBudgetDetailsFormInstance = (
  defaultValues: LineItemBudgetDetailsDefaults,
  onLineItemCreated: (
    lineItem: CreateWfpLineItemBudgetDetailsFormValues,
  ) => void,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: createLineItemBudgetDetailsSchema,
      onSubmit: createLineItemBudgetDetailsSchema,
    },
    onSubmit: async ({ value }) => {
      onLineItemCreated(value)
    },
  })

export type WfpLineItemBudgetDetailsFormApi = ReturnType<
  typeof useLineItemBudgetDetailsFormInstance
>

export interface WfpFormController {
  submitAll: () => Promise<void>
  clearAll: () => void
  pendingItems: LineItemWithId[]
  isSubmitting: boolean
}

interface CreateWfpLineItemBudgetDetailsFormProps {
  libId: string
  libActivityId?: string
  wfpObjectiveActivityId?: string
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: WfpLineItemBudgetDetailsFormApi) => void
  scope?: 'Activity' | 'Project'
  wfpData?: WFPDetails
  projectStartDate?: string | Date
  projectEndDate?: string | Date
  activityStartDate?: Date
  activityEndDate?: Date
  activityBudget?: number
  onSubmitOverride?: (lineItems: LineItemWithId[]) => void
  hideFooterButtons?: boolean
  setFormController?: (controller: WfpFormController) => void
}

const useCreateLineItemBudgetDetails = createMutationHookFromTemplate(
  createLineItemBudgetDetailsRequest,
)

export default function CreateWfpLineItemBudgetDetailsForm({
  libId,
  libActivityId,
  wfpObjectiveActivityId: _wfpObjectiveActivityId,
  onCreated,
  onClose,
  setForm,
  scope,
  wfpData: wfpDataProp,
  projectStartDate: projectStartDateProp,
  projectEndDate: projectEndDateProp,
  onSubmitOverride,
  hideFooterButtons = false,
  setFormController,
}: CreateWfpLineItemBudgetDetailsFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLineItemBudgetDetails()

  // Fetch LIB details if wfpData is not provided to retrieve the source WFP dates
  const { data: libResponse } = useGetLIB({
    pathParams: { id: libId || '' },
    queryParams: {},
    enabled: !!libId && !wfpDataProp && !projectStartDateProp,
  })

  const wfpSourceId = libResponse?.data?.sourceId
  const { data: fetchedWfpResponse } = useGetWFP({
    pathParams: { id: wfpSourceId || '' },
    queryParams: {},
    enabled: !!wfpSourceId && !wfpDataProp && !projectStartDateProp,
  })

  const effectiveWfpData = wfpDataProp || fetchedWfpResponse?.data
  const effectiveStartDate =
    projectStartDateProp ||
    effectiveWfpData?.projectStartDate ||
    (libResponse?.data?.fiscalYear ? `${libResponse.data.fiscalYear.year}-01-01` : undefined)
  const effectiveEndDate =
    projectEndDateProp ||
    effectiveWfpData?.projectEndDate ||
    (libResponse?.data?.fiscalYear ? `${libResponse.data.fiscalYear.year}-12-31` : undefined)

  // State for pending line items to be submitted
  const [lineItems, setLineItems] = useState<LineItemWithId[]>([])
  const [isSubmittingAll, setIsSubmittingAll] = useState(false)
  const [submissionResults, setSubmissionResults] = useState<
    Array<{ tempId: string; success: boolean; error?: string }>
  >([])
  const [inheritedDescription, setInheritedDescription] = useState<
    string | null
  >(null)
  const [autoInheritedName, setAutoInheritedName] = useState<string | null>(null)

  // Timeline type selection: 'quarterly' | 'monthly'
  const [selectedTimelineType, setSelectedTimelineType] = useState<
    'quarterly' | 'monthly'
  >('quarterly')

  // Dynamic period allocations keyed by year-aware period key (e.g. "Q2-2026", "2026-06")
  const [periodAllocations, setPeriodAllocations] = useState<
    Record<string, number>
  >({})

  // Compute all valid periods within the WFP project boundary (supports multi-year and boundary clamping)
  const projectPeriods = useMemo(() => {
    if (!effectiveStartDate || !effectiveEndDate) return []
    return generateProjectPeriods(
      selectedTimelineType,
      effectiveStartDate,
      effectiveEndDate,
    )
  }, [selectedTimelineType, effectiveStartDate, effectiveEndDate])

  // Total allocated budget across all periods
  const totalAllocatedBudget = useMemo(() => {
    return projectPeriods.reduce((sum, p) => sum + (periodAllocations[p.key] || 0), 0)
  }, [projectPeriods, periodAllocations])

  const nonZeroPeriodCount = useMemo(() => {
    return projectPeriods.filter((p) => (periodAllocations[p.key] || 0) > 0).length
  }, [projectPeriods, periodAllocations])

  // Sequential submission of all line items
  const submitAllLineItems = useCallback(async () => {
    if (lineItems.length === 0) {
      toast.error('No line items to submit')
      return
    }

    if (onSubmitOverride) {
      onSubmitOverride(lineItems)
      setLineItems([])
      onCreated?.()
      onClose?.()
      return
    }

    setIsSubmittingAll(true)
    const results: Array<{ tempId: string; success: boolean; error?: string }> =
      []

    try {
      for (const item of lineItems) {
        try {
          const finalObjectId = item.itemOfExpenditureId || item.objectId

          // If single-period allocation covering full cost, unitQuantity & unitCost can be sent.
          // For multi-period slices where budget < unitCost * unitQuantity, omit them on partial slices to match Activity Scope.
          const isFullCoverage =
            item.unitCost &&
            item.unitQuantity &&
            item.budget >= item.unitCost * item.unitQuantity

          await mutateAsync({
            pathParams: {},
            payload: {
              lineItemBudgetId: libId,
              lineItemBudgetActivityId:
                scope === 'Project'
                  ? undefined
                  : libActivityId || undefined,
              wfpObjectiveActivityExpenditureId:
                scope === 'Project'
                  ? undefined
                  : item.wfpObjectiveActivityExpenditureId || undefined,
              objectId: finalObjectId,
              description: item.description || undefined,
              unitQuantity: isFullCoverage ? item.unitQuantity : undefined,
              unitCost: isFullCoverage ? item.unitCost : undefined,
              startDate: item.startDate,
              endDate: item.endDate,
              timelineType: item.timelineType,
              budget: item.budget || 0,
            },
          })

          results.push({
            tempId: item._tempId,
            success: true,
          })
        } catch (error) {
          results.push({
            tempId: item._tempId,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          })
        }
      }

      // Show results
      const successCount = results.filter((r) => r.success).length
      const failureCount = results.filter((r) => !r.success).length

      setSubmissionResults(results)

      if (failureCount === 0) {
        toast.success(`Successfully added ${successCount} line item(s)`)
        setLineItems([])
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].includes('/lib-activities') ||
              query.queryKey[0].includes('/libs') ||
              query.queryKey[0].includes('/line-item-budget-details')),
        })
        onCreated?.()
        onClose?.()
      } else if (successCount > 0) {
        toast.warning(
          `Added ${successCount} item(s), ${failureCount} failed. Please review errors.`,
        )
        // Keep only failed items in the table
        setLineItems((prev) =>
          prev.filter((item) =>
            results.some((r) => r.tempId === item._tempId && !r.success),
          ),
        )
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            (query.queryKey[0].includes('/lib-activities') ||
              query.queryKey[0].includes('/libs') ||
              query.queryKey[0].includes('/line-item-budget-details')),
        })
      } else {
        toast.error('Failed to add line items. Please try again.')
      }
    } finally {
      setIsSubmittingAll(false)
    }
  }, [
    lineItems,
    onSubmitOverride,
    mutateAsync,
    libId,
    libActivityId,
    scope,
    queryClient,
    onCreated,
    onClose,
  ])

  // Clear all pending items
  const handleClearAll = useCallback(() => {
    setLineItems([])
    setSubmissionResults([])
    toast.info('All pending items cleared')
  }, [])

  // Expose controller for external triggers
  useEffect(() => {
    if (setFormController) {
      setFormController({
        submitAll: submitAllLineItems,
        clearAll: handleClearAll,
        pendingItems: lineItems,
        isSubmitting: isSubmittingAll,
      })
    }
  }, [
    setFormController,
    submitAllLineItems,
    handleClearAll,
    lineItems,
    isSubmittingAll,
  ])

  // Single query for all objects (avoids waterfall requests for hierarchy traversal)
  const { data: allObjectsResponse, isLoading: isLoadingObjects } =
    useGetObjects({
      pathParams: {},
      queryParams: {
        pageSize: 5000,
      },
    })

  const allObjects = allObjectsResponse?.data ?? []

  // Resolve expenditure types (sub-classes under Expenses root) via helper
  const expenditureTypes = useMemo(
    () => resolveExpenditureTypes(allObjects).expenditureTypes,
    [allObjects],
  )

  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  // Compute ALL descendants of the selected sub-class (groups, object codes, sub-objects / specification level)
  const descendantExpenditureItems = useMemo(
    () => getDescendantExpenditureItems(allObjects, selectedParentId),
    [allObjects, selectedParentId],
  )

  const lineItemDefaults: LineItemBudgetDetailsDefaults = {
    objectId: '',
    itemOfExpenditureId: undefined,
    description: undefined,
    unitQuantity: undefined,
    unitCost: undefined,
    timelineType: 'quarterly',
  }

  // Handle form submission: stage non-zero period allocations into lineItems
  const handleAddToList = useCallback(
    async (value: CreateWfpLineItemBudgetDetailsFormValues) => {
      try {
        const finalObjectId = value.itemOfExpenditureId || value.objectId

        // Validate that if parent has descendants, an item must be selected
        if (
          descendantExpenditureItems.length > 0 &&
          !value.itemOfExpenditureId
        ) {
          toast.error('Select Item of Expenditure is required')
          return
        }

        // Project Scope dynamic period allocations validation
        const nonZeroPeriods = projectPeriods.filter(
          (p) => (periodAllocations[p.key] || 0) > 0,
        )

        if (nonZeroPeriods.length === 0) {
          toast.error('At least one period with budget > 0 is required')
          return
        }

        // Validate aggregate allocation against computed cost
        const computedCost = (value.unitQuantity || 0) * (value.unitCost || 0)
        const totalAllocated = nonZeroPeriods.reduce(
          (sum, p) => sum + (periodAllocations[p.key] || 0),
          0,
        )

        if (computedCost > 0 && totalAllocated < computedCost) {
          toast.error(
            `Total allocated budget (₱${totalAllocated.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}) must be greater than or equal to the computed cost (Unit Cost ₱${(
              value.unitCost || 0
            ).toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })} × Quantity ${value.unitQuantity || 0} = ₱${computedCost.toLocaleString(
              'en-PH',
              { minimumFractionDigits: 2, maximumFractionDigits: 2 },
            )})`,
          )
          return
        }

        const resolvedObj =
          descendantExpenditureItems.find((o) => o.id === finalObjectId) ||
          allObjects.find((o) => o.id === finalObjectId)

        const resolvedName =
          resolvedObj?.name ||
          autoInheritedName ||
          value.description ||
          'Expenditure Item'
        const resolvedCode = resolvedObj?.code || ''

        // Create staged items for each non-zero period
        const newStagedItems: LineItemWithId[] = nonZeroPeriods.map((p) => ({
          _tempId: `${Date.now()}-${Math.random()}`,
          objectId: finalObjectId,
          itemOfExpenditureId: value.itemOfExpenditureId,
          wfpObjectiveActivityExpenditureId:
            value.wfpObjectiveActivityExpenditureId,
          description: value.description || autoInheritedName || '',
          unitQuantity: value.unitQuantity,
          unitCost: value.unitCost,
          startDate: formatDateToISO(p.startDate),
          endDate: formatDateToISO(p.endDate),
          timelineType:
            selectedTimelineType === 'quarterly' ? 'Quarterly' : 'Monthly',
          budget: periodAllocations[p.key] || 0,
          periodKey: p.key,
          periodLabel: p.label,
          dateRangeLabel: p.dateRangeLabel,
          resolvedName,
          resolvedCode,
        }))

        setLineItems((prev) => [...prev, ...newStagedItems])
        toast.success(
          `${newStagedItems.length} period allocation(s) added to list`,
        )

        // Reset form & allocations
        form.reset()
        setPeriodAllocations({})
        setSelectedParentId(null)
        setAutoInheritedName(null)
        setInheritedDescription(null)
      } catch (error) {
        console.error('Error adding line item:', error)
        toast.error('Failed to add line item')
      }
    },
    [
      expenditureTypes,
      projectPeriods,
      periodAllocations,
      descendantExpenditureItems,
      allObjects,
      autoInheritedName,
      selectedTimelineType,
    ],
  )

  const form = useLineItemBudgetDetailsFormInstance(
    lineItemDefaults,
    handleAddToList,
  )

  // Pass form instance to parent if callback is provided
  useEffect(() => {
    if (setForm) {
      setForm(form)
    }
  }, [form, setForm])

  // Handle parent object selection change
  const handleParentChange = (parentId: string) => {
    setSelectedParentId(parentId)
    form.setFieldValue('objectId', parentId)
    form.setFieldValue('itemOfExpenditureId', undefined)

    // Auto-inherit name only if the selected parent has no deeper children to drill into
    const selectedParent = expenditureTypes?.find((item) => item.id === parentId)
    if (selectedParent && (!selectedParent.childObjectCount || selectedParent.childObjectCount === 0)) {
      setAutoInheritedName(selectedParent.name || null)
    } else {
      setAutoInheritedName(null)
    }
  }

  // Handle period amount change
  const handlePeriodAmountChange = (key: string, valStr: string) => {
    const val = parseFloat(valStr) || 0
    setPeriodAllocations((prev) => ({
      ...prev,
      [key]: val,
    }))
  }

  // Handle deleting a line item from the pending list
  const handleDeleteLineItem = (tempId: string) => {
    setLineItems((prev) => prev.filter((item) => item._tempId !== tempId))
    toast.info('Item removed from list')
  }

  const isLoading =
    isLoadingObjects ||
    isPending

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      {/* Date Window Information Banner */}
      {effectiveStartDate && effectiveEndDate ? (
        <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-900 uppercase tracking-wider text-[11px]">
              WFP Project Window:
            </span>
            <span className="font-semibold text-blue-800">
              {new Date(effectiveStartDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}{' '}
              –{' '}
              {new Date(effectiveEndDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-300 font-semibold text-[10px]"
          >
            {projectPeriods.length}{' '}
            {selectedTimelineType === 'quarterly' ? 'Quarter(s)' : 'Month(s)'}
          </Badge>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            Project start/end dates are not configured for this WFP. Please ensure
            the WFP has valid start and end dates.
          </span>
        </div>
      )}

      {/* Form Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type of Expenditure */}
        <form.Field
          name="objectId"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Type of Expenditure <span className="text-red-500">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={handleParentChange}
                disabled={isLoading}
              >
                <SelectTrigger id={field.name} className="w-full text-xs">
                  <SelectValue placeholder="Select type of expenditure" />
                </SelectTrigger>
                <SelectContent>
                  {expenditureTypes.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} {item.code ? `(${item.code})` : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Item of Expenditure — shows ALL descendants of the selected sub-class */}
        <form.Field
          name="itemOfExpenditureId"
          children={(field) => {
            const hasDescendants = descendantExpenditureItems.length > 0

            return (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-medium">
                  Item of Expenditure
                  {hasDescendants && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={field.state.value || ''}
                  onValueChange={(val) => {
                    field.handleChange(val)
                    const selectedDescendant = descendantExpenditureItems.find(
                      (item) => item.id === val,
                    )
                    if (selectedDescendant) {
                      setAutoInheritedName(selectedDescendant.name || null)
                    }
                  }}
                  disabled={
                    !selectedParentId ||
                    isLoadingObjects ||
                    !hasDescendants ||
                    isLoading
                  }
                >
                  <SelectTrigger id={field.name} className="w-full text-xs">
                    <SelectValue
                      placeholder={
                        !selectedParentId
                          ? 'Select Type of Expenditure first'
                          : isLoadingObjects
                            ? 'Loading items...'
                            : hasDescendants
                              ? 'Select item of expenditure'
                              : 'No sub-items available'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent className="max-h-72">
                    {descendantExpenditureItems.map((item) => {
                      const indent = item.depth * 16
                      const prefix = item.depth > 0 ? '↳ ' : ''
                      const weightClass = item.depth === 0
                        ? 'font-medium text-slate-800'
                        : item.isLeaf
                          ? 'text-slate-700'
                          : 'text-slate-600'
                      const dimClass = !item.isLeaf ? 'opacity-70' : ''
                      return (
                        <SelectItem
                          key={item.id}
                          value={item.id}
                          disabled={!item.isLeaf}
                          className={`cursor-pointer ${dimClass}`}
                          style={{ paddingLeft: `${indent + 8}px` }}
                        >
                          <span className={`text-xs ${weightClass}`}>
                            {prefix}{item.name}
                            {item.code ? ` (${item.code})` : ''}
                          </span>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </div>
            )
          }}
        />

        {/* Description */}
        <form.Field
          name="description"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={field.name} className="font-medium">
                Description
              </Label>
              <Input
                id={field.name}
                type="text"
                placeholder={
                  inheritedDescription ||
                  autoInheritedName ||
                  'Enter description'
                }
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="w-full text-xs"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Unit Quantity */}
        <form.Field
          name="unitQuantity"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Unit Quantity
              </Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Enter unit quantity"
                value={field.state.value || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || undefined
                  field.handleChange(val)
                }}
                disabled={isLoading}
                className="w-full text-xs"
                min="0"
                step="1"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Unit Cost */}
        <form.Field
          name="unitCost"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Unit Cost (₱)
              </Label>
              <Input
                id={field.name}
                type="number"
                placeholder="Enter unit cost"
                value={field.state.value || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || undefined
                  field.handleChange(val)
                }}
                disabled={isLoading}
                className="w-full text-xs"
                min="0"
                step="0.01"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Timeline Type */}
        <form.Field
          name="timelineType"
          children={(field) => (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor={field.name} className="font-medium">
                Timeline Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={selectedTimelineType}
                onValueChange={(val: 'quarterly' | 'monthly') => {
                  setSelectedTimelineType(val)
                  field.handleChange(val)
                  setPeriodAllocations({})
                }}
                disabled={isLoading}
              >
                <SelectTrigger id={field.name} className="w-full text-xs">
                  <SelectValue placeholder="Select timeline type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      {/* Dynamic Project Period Allocation Panel */}
      {projectPeriods.length > 0 && (
        <div className="space-y-4 border-t border-slate-200 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-800">
                {selectedTimelineType === 'quarterly'
                  ? 'Quarterly Budget Allocation'
                  : 'Monthly Budget Allocation'}
              </h3>
              <p className="text-xs text-slate-500">
                Enter budget amounts for the periods within the WFP project
                duration.
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              {projectPeriods.length} active period(s)
            </span>
          </div>

          {/* Period Inputs Grid */}
          <div
            className={`grid gap-3 ${
              selectedTimelineType === 'quarterly'
                ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-4'
                : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'
            }`}
          >
            {projectPeriods.map((period) => {
              const currentVal = periodAllocations[period.key] || 0
              return (
                <div
                  key={period.key}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5 focus-within:border-blue-500 focus-within:bg-white transition-all"
                >
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`period-${period.key}`}
                      className="text-xs font-bold text-slate-800"
                    >
                      {period.label}
                    </Label>
                    {(period.isFirstPeriodClamped ||
                      period.isLastPeriodClamped) && (
                      <Badge
                        variant="soft"
                        className="text-[9px] px-1 py-0 bg-amber-50 text-amber-700 border border-amber-200"
                        title="Period boundary clamped to project start/end date"
                      >
                        Clamped
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500">
                    {period.dateRangeLabel}
                  </p>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-medium">
                      ₱
                    </span>
                    <Input
                      id={`period-${period.key}`}
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={currentVal || ''}
                      onChange={(e) =>
                        handlePeriodAmountChange(period.key, e.target.value)
                      }
                      disabled={isLoading}
                      className="pl-6 text-xs h-8 font-semibold text-slate-900 bg-white"
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Allocation Summary Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Allocation Summary
              </span>
              <p className="text-slate-500 text-[11px]">
                {nonZeroPeriodCount}{' '}
                {nonZeroPeriodCount === 1
                  ? 'period record'
                  : 'period records'}{' '}
                will be staged for creation
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">
                Total Budget:
              </span>
              <span className="text-base font-bold text-emerald-600">
                ₱
                {totalAllocatedBudget.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Form Action Button: Add to List */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isLoading || isSubmittingAll}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          Add to List
        </Button>
      </div>

      {/* Line Items Table */}
      {lineItems.length > 0 && (
        <div className="mt-8 space-y-4 border-t border-slate-100 pt-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-800 tracking-wider uppercase">
              Pending Line Items ({lineItems.length})
            </h3>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-xl shadow-xs bg-white">
            <table className="w-full text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Type of Expenditure
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Timeline
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Budget
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Unit Qty
                  </th>
                  <th className="px-4 py-3 text-right font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Unit Cost
                  </th>
                  <th className="px-4 py-3 text-center font-bold text-slate-700 uppercase tracking-wider text-[10px] w-24">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lineItems.map((item) => {
                  const itemObject =
                    allObjects.find(
                      (obj) => obj.id === item.objectId,
                    )

                  const isItemFailed = submissionResults.some(
                    (r) => r.tempId === item._tempId && !r.success,
                  )

                  return (
                    <tr
                      key={item._tempId}
                      className={cn(
                        'hover:bg-slate-50/80 transition-colors',
                        isItemFailed && 'bg-red-50/70 hover:bg-red-50',
                      )}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.resolvedName || itemObject?.name}{' '}
                        {item.resolvedCode || itemObject?.code
                          ? `(${item.resolvedCode || itemObject?.code})`
                          : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.description || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200 w-fit"
                          >
                            {item.periodLabel || item.timelineType}
                          </Badge>
                          {item.dateRangeLabel && (
                            <span className="text-[10px] text-slate-400">
                              {item.dateRangeLabel}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-950">
                        ₱
                        {item.budget?.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {item.unitQuantity || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        ₱
                        {item.unitCost?.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }) || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 justify-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteLineItem(item._tempId)}
                            disabled={isSubmittingAll}
                            title="Delete this item"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Submission Status */}
          {submissionResults.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">
                Submission Status:
              </h4>
              <ul className="space-y-1.5 text-xs">
                {submissionResults.map((result) => {
                  const item = lineItems.find((i) => i._tempId === result.tempId)
                  const itemObject =
                    allObjects.find(
                      (obj) => obj.id === item?.objectId,
                    )
                  return (
                    <li
                      key={result.tempId}
                      className={cn(
                        'flex items-center gap-1.5 font-semibold',
                        result.success ? 'text-green-600' : 'text-red-600',
                      )}
                    >
                      <span>{result.success ? '✓' : '✗'}</span>
                      <span>{item?.resolvedName || itemObject?.name}</span>
                      {result.error && (
                        <span className="text-[10px] font-normal text-slate-500">
                          ({result.error})
                        </span>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Submit All Button */}
      {lineItems.length > 0 && !hideFooterButtons && (
        <div className="flex justify-end gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleClearAll}
            disabled={isSubmittingAll}
          >
            Clear All
          </Button>
          <Button
            type="button"
            onClick={submitAllLineItems}
            disabled={isSubmittingAll || lineItems.length === 0}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSubmittingAll ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Submit All Items ({lineItems.length})
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
