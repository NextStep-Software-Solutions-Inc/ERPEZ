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
import PeriodAllocationPanel from './PeriodAllocationPanel'
import {
  generateQuarterlyPeriodDetails,
  generateMonthlyPeriodDetails,
  formatDateToISO,
  QuarterlyAllocation,
  MonthlyAllocation,
} from '../utils/periodAllocationHelpers'
import {
  submitConcurrentPeriodAllocations,
  generateSubmissionSummary,
  ConcurrentSubmissionOutcome,
} from '../handlers/concurrentSubmissionHandler'
import { PeriodAllocationPayload } from '../types/wfp-line-item'

const TIMELINE_TYPES = [
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'monthly', label: 'Monthly' },
] as const

const PERIOD_TIMELINE_TYPES = ['monthly', 'quarterly']

const useGetObjects = createQueryHookFromTemplate(getObjectsRequest)

// Hook for fetching child objects based on parent selection
const useGetChildObjects = (parentId: string | null) => {
  return useGetObjects({
    pathParams: {},
    queryParams: {
      filters: parentId ? `parentId==${parentId}` : 'parentId==null',
      pageSize: 1000,
    },
    enabled: !!parentId,
  })
}

// Conditional validation: Budget is required only for non-period timeline types
const createLineItemBudgetDetailsSchema = z
  .object({
    objectId: z.string().min(1, 'Type of Expenditure is required'),
    itemOfExpenditureId: z.string(),
    description: z.string().min(10, 'Description is required'),
    // unitQuantity: z.number(),
    // unitCost: z.number(),
    timelineType: z.string().min(1, 'Timeline Type is required'),
    startDate: z.string(),
    endDate: z.string(),
    budget: z.number(),
  })
  .refine(
    (data) => {
      // For non-period timeline types, budget is required
      if (!PERIOD_TIMELINE_TYPES.includes(data.timelineType)) {
        return data.budget >= 0.01
      }
      return true
    },
    {
      message: 'Budget must be greater than 0',
      path: ['budget'],
    },
  )
  .refine(
    (data) => {
      // For non-period timeline types, dates are required
      if (!PERIOD_TIMELINE_TYPES.includes(data.timelineType)) {
        return data.startDate && data.endDate
      }
      return true
    },
    {
      message: 'Dates are required',
      path: ['startDate'],
    },
  )

export type CreateLineItemBudgetDetailsFormValues = z.infer<
  typeof createLineItemBudgetDetailsSchema
>

interface LineItemBudgetDetailsDefaults {
  objectId: string
  itemOfExpenditureId: string
  description: string
  // unitQuantity: number
  // unitCost: number
  timelineType: string
  startDate: string
  endDate: string
  budget: number
}

// Helper to extract the form type
const useLineItemBudgetDetailsFormInstance = (
  defaultValues: LineItemBudgetDetailsDefaults,
  onLineItemCreated: (lineItem: CreateLineItemBudgetDetailsFormValues) => Promise<void> | void,
) =>
  useForm({
    defaultValues,
    validators: {
      onChange: createLineItemBudgetDetailsSchema,
    },
    onSubmit: async ({ value }) => {
      await onLineItemCreated(value)
    },
  })

export type LineItemBudgetDetailsFormApi = ReturnType<
  typeof useLineItemBudgetDetailsFormInstance
>

interface CreateLineItemBudgetDetailsFormProps {
  libId: string
  libActivityId: string
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: LineItemBudgetDetailsFormApi) => void
  activityStartDate?: Date // For period-based allocation date calculations
  activityEndDate?: Date // For period-based allocation date calculations
  activityBudget?: number // For validating period sum
  onSubmitOverride?: (value: CreateLineItemBudgetDetailsFormValues, periods: any[]) => void
}

const useCreateLineItemBudgetDetails = createMutationHookFromTemplate(
  createLineItemBudgetDetailsRequest,
)

export default function CreateLineItemBudgetDetailsForm({
  libId,
  libActivityId,
  onCreated,
  onClose,
  setForm,
  activityStartDate = new Date(),
  activityEndDate = new Date(),
  activityBudget,
  onSubmitOverride,
}: CreateLineItemBudgetDetailsFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLineItemBudgetDetails()

  // Fetch root objects (parentId==null) to locate the Expenses root object
  const { data: rootObjectsResponse, isLoading: isLoadingRootObjects } = useGetObjects({
    pathParams: {},
    queryParams: {
      filters: `parentId==null`,
      pageSize: 1000,
    },
  })

  // Locate the Expenses root container object if one exists
  const expensesRootObject = useMemo(() => {
    return rootObjectsResponse?.data?.find(
      (item) =>
        item.code === 'CLS:Expenses' ||
        item.name?.toLowerCase() === 'expenses' ||
        item.code === '50000000' ||
        item.code === '5000000000',
    )
  }, [rootObjectsResponse?.data])

  // Fetch expenditure types (children of Expenses, if an Expenses container exists)
  const { data: expenditureTypesResponse, isLoading: isLoadingExpenditureTypes } = useGetObjects({
    pathParams: {},
    queryParams: {
      filters: expensesRootObject ? `parentId==${expensesRootObject.id}` : undefined,
      pageSize: 1000,
    },
    enabled: !!expensesRootObject,
  })

  const expenditureTypes = useMemo(() => {
    // If an Expenses root container exists and has children, use those children (PS, MOOE, CO, etc.)
    if (expensesRootObject && expenditureTypesResponse?.data && expenditureTypesResponse.data.length > 0) {
      return expenditureTypesResponse.data
    }
    // Otherwise, the root objects themselves (parentId==null) are the expenditure types (e.g. PS, MOOE, CO)
    return (rootObjectsResponse?.data ?? []).filter(
      (item) => item.id !== expensesRootObject?.id,
    )
  }, [expensesRootObject, expenditureTypesResponse?.data, rootObjectsResponse?.data])

  // Period allocation state
  const [periodAllocation, setPeriodAllocation] = useState<
    QuarterlyAllocation | MonthlyAllocation
  >({
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
  })
  const [submissionOutcome, setSubmissionOutcome] =
    useState<ConcurrentSubmissionOutcome | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [autoInheritedName, setAutoInheritedName] = useState<string | null>(null)

  const lineItemDefaults: LineItemBudgetDetailsDefaults = {
    objectId: '',
    itemOfExpenditureId: '',
    description: '',
    // unitQuantity: 0,
    // unitCost: 0,
    timelineType: 'quarterly',
    startDate: '',
    endDate: '',
    budget: 0,
  }

  // Handle period allocation change
  const handlePeriodAllocationChange = useCallback(
    (allocation: QuarterlyAllocation | MonthlyAllocation) => {
      setPeriodAllocation(allocation)
    },
    [],
  )

  // Handle form submission with concurrent period allocation logic
  const handleLineItemSubmit = useCallback(
    async (value: CreateLineItemBudgetDetailsFormValues) => {
      try {
        const timelineType = value.timelineType

        // Determine final objectId: use child if selected, otherwise use parent
        const finalObjectId = value.itemOfExpenditureId || value.objectId

        // Get the selected parent object to check if it has children
        const parentObject = expenditureTypes?.find(
          (item) => item.id === value.objectId,
        )

        // Validate that if parent has children, child must be selected
        if (
          (parentObject?.childObjectCount || 0) > 0 &&
          !value.itemOfExpenditureId
        ) {
          toast.error('Select Item of Expenditure is required')
          return
        }

        // Period-based allocation path (Quarterly or Monthly)
        if (PERIOD_TIMELINE_TYPES.includes(timelineType)) {
          setIsSubmitting(true)
          setSubmissionOutcome(null)

          // Generate period details
          const periods =
            timelineType === 'quarterly'
              ? generateQuarterlyPeriodDetails(
                  periodAllocation as QuarterlyAllocation,
                  activityStartDate,
                )
              : generateMonthlyPeriodDetails(
                  periodAllocation as MonthlyAllocation,
                  activityStartDate,
                )

          // Validate at least one non-zero period
          if (periods.length === 0) {
            toast.error('At least one period with budget > 0 is required')
            setIsSubmitting(false)
            return
          }

          if (onSubmitOverride) {
            onSubmitOverride(value, periods)
            setIsSubmitting(false)
            onCreated?.()
            onClose?.()
            return
          }

          // Create submit function for concurrent execution
          const submitFunction = async (period: {
            period: string
            payload: PeriodAllocationPayload
          }) => {
            await mutateAsync({
              pathParams: {},
              payload: period.payload,
            })
          }

          // Create payloads for all periods
          const submitPayloads: Array<{
            period: string
            payload: PeriodAllocationPayload
          }> = periods.map((period) => ({
            period: period.period,
            payload: {
              lineItemBudgetId: libId,
              lineItemBudgetActivityId: libActivityId,
              wfpObjectiveActivityExpenditureId: undefined,
              objectId: finalObjectId,
              description: value.description || undefined,
              // unitQuantity: value.unitQuantity || undefined,
              // unitCost: value.unitCost || undefined,
              timelineType: timelineType,
              startDate: formatDateToISO(period.startDate),
              endDate: formatDateToISO(period.endDate),
              budget: period.budget,
            },
          }))

          // Submit concurrently
          const outcome = await submitConcurrentPeriodAllocations(
            submitFunction,
            submitPayloads,
          )

          setSubmissionOutcome(outcome)

          // Handle result
          if (outcome.failureCount === 0) {
            toast.success(generateSubmissionSummary(outcome))
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].includes('/lib-activities') ||
                  query.queryKey[0].includes('/libs')),
            })
            onCreated?.()
            onClose?.()
          } else if (outcome.successCount > 0) {
            // Partial success
            toast.warning(generateSubmissionSummary(outcome))
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].includes('/lib-activities') ||
                  query.queryKey[0].includes('/libs')),
            })
            // Keep form open to show failures
          } else {
            // All failed
            toast.error(generateSubmissionSummary(outcome))
          }

          setIsSubmitting(false)
        } else {
          // Single-period allocation path (Daily, Weekly, Yearly)
          await mutateAsync({
            pathParams: {},
            payload: {
              lineItemBudgetId: libId,
              lineItemBudgetActivityId: libActivityId,
              wfpObjectiveActivityExpenditureId: undefined,
              objectId: finalObjectId,
              description: value.description || undefined,
              // unitQuantity: value.unitQuantity || undefined,
              // unitCost: value.unitCost || undefined,
              timelineType: value.timelineType || undefined,
              startDate: value.startDate || undefined,
              endDate: value.endDate || undefined,
              budget: value.budget || 0,
            },
          })
          void queryClient.invalidateQueries({
            predicate: (query) =>
              typeof query.queryKey[0] === 'string' &&
              (query.queryKey[0].includes('/lib-activities') ||
                query.queryKey[0].includes('/libs')),
          })
          onCreated?.()
          onClose?.()
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to create line item'
        toast.error(message)
        setIsSubmitting(false)
      }
    },
    [
      libId,
      libActivityId,
      mutateAsync,
      queryClient,
      onCreated,
      onClose,
      periodAllocation,
      activityStartDate,
      activityEndDate,
      expenditureTypes,
    ],
  )

  const form = useLineItemBudgetDetailsFormInstance(
    lineItemDefaults,
    handleLineItemSubmit,
  )

  // Expose form to parent on creation via effect
  useEffect(() => {
    setForm?.(form)
  }, [form, setForm])

  // Get the selected parent object details
  const selectedParentObject = useMemo(() => {
    if (!expenditureTypes) return undefined
    return expenditureTypes.find((item) => item.id === selectedParentId)
  }, [selectedParentId, expenditureTypes])

  // Fetch child objects only when parent is selected and has children
  const { data: childObjectsResponse, isLoading: isLoadingChildObjects } =
    useGetChildObjects(selectedParentId)

  const currentTimelineType = form.getFieldValue('timelineType')
  const isPeriodTimeline = PERIOD_TIMELINE_TYPES.includes(currentTimelineType)
  const isLoading = isPending || isSubmitting
  const isLoadingTypes = isLoadingRootObjects || isLoadingExpenditureTypes

  return (
    <form
      id="create-line-item-budget-details-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-3.5"
    >
      {/* Type of Expenditure Selection */}
      <form.Field
        name="objectId"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-medium">
              Type of Expenditure
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value)
                setSelectedParentId(value)
                // Reset child selection when parent changes
                form.setFieldValue('itemOfExpenditureId', '')

                // Smart description inheritance if category has no child items
                const selectedParent = expenditureTypes.find((item) => item.id === value)
                if (selectedParent && (!selectedParent.childObjectCount || selectedParent.childObjectCount === 0)) {
                  const currentDesc = form.getFieldValue('description') as string | undefined
                  const isEmpty = !currentDesc || currentDesc.trim() === ''
                  const matchesPreviousAuto = autoInheritedName && currentDesc === autoInheritedName
                  const matchesAnyObjName = expenditureTypes.some((i) => i.name === currentDesc)

                  if (isEmpty || matchesPreviousAuto || matchesAnyObjName) {
                    form.setFieldValue('description', selectedParent.name || '')
                    setAutoInheritedName(selectedParent.name || null)
                  }
                }
              }}
              disabled={isLoading || isLoadingTypes}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue
                  placeholder={
                    isLoadingTypes
                      ? 'Loading types of expenditure...'
                      : 'Select type of expenditure'
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {expenditureTypes.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                    {item.code ? ` (${item.code})` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Select Item of Expenditure - Conditionally shown when parent has children */}
      {selectedParentObject && selectedParentObject.childObjectCount > 0 && (
        <form.Field
          name="itemOfExpenditureId"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-medium">
                Select Item of Expenditure
              </Label>
              <Select
                value={field.state.value || ''}
                onValueChange={(val) => {
                  field.handleChange(val)

                  // Smart Description Inheritance Logic
                  const children = childObjectsResponse?.data || []
                  const selectedChild = children.find((item) => item.id === val)

                  if (selectedChild) {
                    const currentDesc = form.getFieldValue('description') as string | undefined
                    const isEmpty = !currentDesc || currentDesc.trim() === ''
                    const matchesPreviousAuto = autoInheritedName && currentDesc === autoInheritedName
                    const matchesAnyObjName = children.some((i) => i.name === currentDesc)

                    // Rule A (Empty) or Rule B (Default Match): update Description
                    if (isEmpty || matchesPreviousAuto || matchesAnyObjName) {
                      form.setFieldValue('description', selectedChild.name || '')
                      setAutoInheritedName(selectedChild.name || null)
                    }
                    // Rule C (Custom Edit): If user manually edited description, do NOT overwrite it!
                  }
                }}
                disabled={isLoading || isLoadingChildObjects}
              >
                <SelectTrigger id={field.name} className="w-full">
                  <SelectValue
                    placeholder={
                      isLoadingChildObjects
                        ? 'Loading items...'
                        : 'Select item of expenditure'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {childObjectsResponse?.data?.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                      {item.code ? ` (${item.code})` : ''}
                    </SelectItem>
                  )) || []}
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      {/* Description */}
      <form.Field
        name="description"
        children={(field) => (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.name} className="font-medium">
                Description
              </Label>
              {autoInheritedName && field.state.value === autoInheritedName && (
                <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                  Auto-inherited
                </span>
              )}
            </div>
            <Input
              id={field.name}
              type="text"
              placeholder="Enter description"
              value={field.state.value || ''}
              onChange={(e) => field.handleChange(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Timeline Type */}
      <form.Field
        name="timelineType"
        children={(field) => (
          <div className="space-y-1.5">
            <Label htmlFor={field.name} className="font-medium">
              Timeline Type
            </Label>
            <Select
              value={field.state.value || ''}
              onValueChange={(value) => {
                field.handleChange(value)
                // Reset period allocation when timeline type changes
                if (value === 'monthly') {
                  setPeriodAllocation({
                    january: 0,
                    february: 0,
                    march: 0,
                    april: 0,
                    may: 0,
                    june: 0,
                    july: 0,
                    august: 0,
                    september: 0,
                    october: 0,
                    november: 0,
                    december: 0,
                  })
                } else {
                  setPeriodAllocation({ q1: 0, q2: 0, q3: 0, q4: 0 })
                }
              }}
              disabled={isLoading}
            >
              <SelectTrigger id={field.name} className="w-full">
                <SelectValue placeholder="Select timeline type" />
              </SelectTrigger>
              <SelectContent>
                {TIMELINE_TYPES.map((timeline) => (
                  <SelectItem key={timeline.id} value={timeline.id}>
                    {timeline.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldInfo field={field} />
          </div>
        )}
      />

      {/* Budget Field - Only shown for non-period timeline types */}
      {!isPeriodTimeline && (
        <form.Field
          name="budget"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Budget
              </Label>
              <Input
                id={field.name}
                type="number"
                step="0.01"
                placeholder="0"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(parseFloat(e.target.value))}
                disabled={isLoading}
                className="w-full"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      {/* Start Date - Only shown for non-period timeline types */}
      {!isPeriodTimeline && (
        <form.Field
          name="startDate"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Start Date
              </Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={
                  field.state.value
                    ? new Date(field.state.value).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) {
                    field.handleChange(new Date(e.target.value).toISOString())
                  } else {
                    field.handleChange('')
                  }
                }}
                disabled={isLoading}
                className="w-full"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      {/* End Date - Only shown for non-period timeline types */}
      {!isPeriodTimeline && (
        <form.Field
          name="endDate"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                End Date
              </Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={
                  field.state.value
                    ? new Date(field.state.value).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) => {
                  if (e.target.value) {
                    field.handleChange(new Date(e.target.value).toISOString())
                  } else {
                    field.handleChange('')
                  }
                }}
                disabled={isLoading}
                className="w-full"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />
      )}

      {/* Period Allocation Panel - Only shown for period timeline types */}
      {isPeriodTimeline && (
        <PeriodAllocationPanel
          timelineType={currentTimelineType as 'quarterly' | 'monthly'}
          allocation={periodAllocation}
          onAllocationChange={handlePeriodAllocationChange}
          activityStartDate={activityStartDate}
          activityEndDate={activityEndDate}
          maxBudget={activityBudget}
          isDisabled={isLoading}
        />
      )}

      {/* Submission Outcome - Show failures if partial success */}
      {submissionOutcome && submissionOutcome.failureCount > 0 && (
        <div className="rounded-md bg-orange-50 p-4 border border-orange-200">
          <h4 className="font-medium text-orange-900 mb-2">
            {submissionOutcome.successCount > 0
              ? 'Partial Success'
              : 'Submission Failed'}
          </h4>
          {submissionOutcome.failureCount > 0 && (
            <div className="space-y-1">
              <p className="text-sm text-orange-800 font-medium">
                Failed periods:
              </p>
              <ul className="text-sm text-orange-700 space-y-1 list-disc list-inside">
                {submissionOutcome.failed.map((failure) => (
                  <li key={failure.period}>
                    {failure.period}: {failure.error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </form>
  )
}
