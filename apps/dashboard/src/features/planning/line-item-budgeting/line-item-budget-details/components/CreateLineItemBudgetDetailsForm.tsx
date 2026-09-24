import { useEffect, useMemo, useState, useCallback } from 'react'
import { toast } from 'sonner'
import { Sparkles, Split } from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
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
  STANDARD_QUARTERS,
  getCoveredQuarters,
  generateMonthlyPeriodDetails,
  formatDateToISO,
  type MonthlyAllocation,
} from '../utils/periodAllocationHelpers'
import {
  submitConcurrentPeriodAllocations,
  generateSubmissionSummary,
  ConcurrentSubmissionOutcome,
} from '../handlers/concurrentSubmissionHandler'
import { PeriodAllocationPayload } from '../types/wfp-line-item'
import {
  resolveExpenditureTypes,
  getDescendantExpenditureItems,
} from '../utils/expenditureHierarchyHelpers'
import { ExpenditureItemCombobox } from './ExpenditureItemCombobox'
import { formatCurrencyPHP } from '@/utils/formatters'

const TIMELINE_TYPES = [
  { id: 'quarterly', label: 'Quarterly' },
  { id: 'monthly', label: 'Monthly' },
] as const

const useGetObjects = createQueryHookFromTemplate(getObjectsRequest)

const createLineItemBudgetDetailsSchema = z.object({
  objectId: z.string().min(1, 'Type of Expenditure is required'),
  itemOfExpenditureId: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  timelineType: z.string().min(1, 'Timeline Type is required'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
})

export type CreateLineItemBudgetDetailsFormValues = z.infer<
  typeof createLineItemBudgetDetailsSchema
>

interface LineItemBudgetDetailsDefaults {
  objectId: string
  itemOfExpenditureId: string
  description: string
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

export interface SplitInfo {
  isSplitMode: boolean
  count: number
}

interface CreateLineItemBudgetDetailsFormProps {
  libId: string
  libActivityId: string
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: LineItemBudgetDetailsFormApi) => void
  activityStartDate?: Date
  activityEndDate?: Date
  activityBudget?: number
  onSubmitOverride?: (value: CreateLineItemBudgetDetailsFormValues, periods: any[]) => void
  onSplitInfoChange?: (info: SplitInfo) => void
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
  onSplitInfoChange,
}: CreateLineItemBudgetDetailsFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLineItemBudgetDetails()

  // Fetch all objects (up to 5000) to build the complete UACS hierarchy
  const { data: allObjectsResponse, isLoading: isLoadingObjects } = useGetObjects({
    pathParams: {},
    queryParams: {
      pageSize: 5000,
    },
  })

  const allObjects = useMemo(
    () => allObjectsResponse?.data ?? [],
    [allObjectsResponse?.data],
  )

  const { expenditureTypes } = useMemo(
    () => resolveExpenditureTypes(allObjects),
    [allObjects],
  )

  const currentYear = activityStartDate
    ? activityStartDate.getFullYear()
    : new Date().getFullYear()

  const defaultQuarter = 'Q1'
  const defaultQuarterDef = STANDARD_QUARTERS[0]
  const defaultStartDate = new Date(
    Date.UTC(currentYear, defaultQuarterDef.startMonth, defaultQuarterDef.startDay),
  )
    .toISOString()
    .split('T')[0]
  const defaultEndDate = new Date(
    Date.UTC(currentYear, defaultQuarterDef.endMonth, defaultQuarterDef.endDay),
  )
    .toISOString()
    .split('T')[0]

  // Form states
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)
  const [autoInheritedName, setAutoInheritedName] = useState<string | null>(null)
  const [budget, setBudget] = useState<string>('')
  const [timelineType, setTimelineType] = useState<string>('quarterly')
  const [selectedQuarter, setSelectedQuarter] = useState<string>(defaultQuarter)
  const [startDate, setStartDate] = useState<string>(defaultStartDate)
  const [endDate, setEndDate] = useState<string>(defaultEndDate)

  // Split mode state
  const [isSplitMode, setIsSplitMode] = useState<boolean>(false)
  const [splitBudgets, setSplitBudgets] = useState<Record<string, string>>({})

  // Covered quarters based on current dates
  const coveredQuarters = useMemo(
    () => getCoveredQuarters(startDate, endDate),
    [startDate, endDate],
  )
  const spansMultipleQuarters = coveredQuarters.length > 1

  const splitSum = useMemo(() => {
    return Object.values(splitBudgets).reduce(
      (acc, val) => acc + (parseFloat(val) || 0),
      0,
    )
  }, [splitBudgets])

  const totalBudgetNum = parseFloat(budget) || 0

  // Period allocation state for monthly
  const [periodAllocation, setPeriodAllocation] = useState<MonthlyAllocation>({
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
  const [submissionOutcome, setSubmissionOutcome] =
    useState<ConcurrentSubmissionOutcome | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Notify parent dialog about split info
  useEffect(() => {
    onSplitInfoChange?.({
      isSplitMode,
      count: coveredQuarters.length,
    })
  }, [isSplitMode, coveredQuarters.length, onSplitInfoChange])

  const lineItemDefaults: LineItemBudgetDetailsDefaults = {
    objectId: '',
    itemOfExpenditureId: '',
    description: '',
    timelineType: 'quarterly',
    startDate: defaultStartDate,
    endDate: defaultEndDate,
    budget: 0,
  }

  // Handle monthly period allocation change
  const handlePeriodAllocationChange = useCallback(
    (allocation: MonthlyAllocation) => {
      setPeriodAllocation(allocation)
    },
    [],
  )

  // Compute descendants of the selected parent category
  const descendantExpenditureItems = useMemo(
    () => getDescendantExpenditureItems(allObjects, selectedParentId),
    [allObjects, selectedParentId],
  )

  const handleToggleSplitMode = () => {
    if (!isSplitMode) {
      const totalB = parseFloat(budget) || 0
      const count = coveredQuarters.length || 2
      const perQ = Math.floor((totalB / count) * 100) / 100
      const initial: Record<string, string> = {}
      coveredQuarters.forEach((q, idx) => {
        if (idx === count - 1) {
          initial[q.id] = (totalB - perQ * (count - 1)).toFixed(2)
        } else {
          initial[q.id] = perQ.toFixed(2)
        }
      })
      setSplitBudgets(initial)
      setIsSplitMode(true)
    } else {
      setIsSplitMode(false)
    }
  }

  const handleEqualizeBudgets = () => {
    const totalB = parseFloat(budget) || 0
    const count = coveredQuarters.length || 2
    const perQ = Math.floor((totalB / count) * 100) / 100
    const initial: Record<string, string> = {}
    coveredQuarters.forEach((q, idx) => {
      if (idx === count - 1) {
        initial[q.id] = (totalB - perQ * (count - 1)).toFixed(2)
      } else {
        initial[q.id] = perQ.toFixed(2)
      }
    })
    setSplitBudgets(initial)
  }

  const handleQuarterChange = (qId: string) => {
    setSelectedQuarter(qId)
    setIsSplitMode(false)
    const quarterDef = STANDARD_QUARTERS.find((q) => q.id === qId)
    if (!quarterDef) return

    const year = startDate
      ? new Date(startDate).getFullYear()
      : currentYear

    const s = new Date(Date.UTC(year, quarterDef.startMonth, quarterDef.startDay))
    const e = new Date(Date.UTC(year, quarterDef.endMonth, quarterDef.endDay))
    const sStr = s.toISOString().split('T')[0]
    const eStr = e.toISOString().split('T')[0]

    setStartDate(sStr)
    setEndDate(eStr)
    form.setFieldValue('startDate', sStr)
    form.setFieldValue('endDate', eStr)
  }

  // Handle form submission with Option 2 Split or Single Period
  const handleLineItemSubmit = useCallback(
    async (value: CreateLineItemBudgetDetailsFormValues) => {
      try {
        const currentTimeline = value.timelineType || timelineType

        // Determine final objectId: use child if selected, otherwise use parent
        const finalObjectId = value.itemOfExpenditureId || value.objectId

        if (!finalObjectId) {
          toast.error('Type of Expenditure is required')
          return
        }

        // Get the selected parent object to check if it has children
        const parentObject = expenditureTypes?.find(
          (item) => item.id === value.objectId,
        )

        // Validate that if parent has children, child must be selected
        if (
          (descendantExpenditureItems.length > 0 || (parentObject?.childObjectCount || 0) > 0) &&
          !value.itemOfExpenditureId
        ) {
          toast.error('Select Item of Expenditure is required')
          return
        }

        if (!value.description || value.description.trim() === '') {
          toast.error('Description is required')
          return
        }

        if (currentTimeline === 'quarterly') {
          if (isSplitMode) {
            if (coveredQuarters.length < 2) {
              toast.error('At least 2 quarters are required to split')
              return
            }

            for (const q of coveredQuarters) {
              const val = parseFloat(splitBudgets[q.id] || '0')
              if (isNaN(val) || val <= 0) {
                toast.error(
                  `Please provide a valid budget greater than 0 for ${q.label}`,
                )
                return
              }
            }

            setIsSubmitting(true)

            const periods = coveredQuarters.map((q) => ({
              period: q.label,
              startDate: new Date(q.startDate),
              endDate: new Date(q.endDate),
              budget: parseFloat(splitBudgets[q.id] || '0'),
              payload: {
                lineItemBudgetId: libId,
                lineItemBudgetActivityId: libActivityId,
                wfpObjectiveActivityExpenditureId: undefined,
                objectId: finalObjectId,
                description: value.description.trim() || undefined,
                timelineType: 'quarterly',
                startDate: formatDateToISO(new Date(q.startDate)),
                endDate: formatDateToISO(new Date(q.endDate)),
                budget: parseFloat(splitBudgets[q.id] || '0'),
              },
            }))

            if (onSubmitOverride) {
              onSubmitOverride(value, periods)
              setIsSubmitting(false)
              onCreated?.()
              onClose?.()
              return
            }

            const submitFunction = async (period: {
              period: string
              payload: PeriodAllocationPayload
            }) => {
              await mutateAsync({
                pathParams: {},
                payload: period.payload,
              })
            }

            const outcome = await submitConcurrentPeriodAllocations(
              submitFunction,
              periods.map((p) => ({ period: p.period, payload: p.payload })),
            )

            setSubmissionOutcome(outcome)

            if (outcome.failureCount === 0) {
              toast.success(
                `Successfully created ${coveredQuarters.length} quarterly line items!`,
              )
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  (query.queryKey[0].includes('/line-item-budget-details') ||
                    query.queryKey[0].includes('/lib-activities') ||
                    query.queryKey[0].includes('/libs')),
              })
              onCreated?.()
              onClose?.()
            } else if (outcome.successCount > 0) {
              toast.warning(generateSubmissionSummary(outcome))
              void queryClient.invalidateQueries({
                predicate: (query) =>
                  typeof query.queryKey[0] === 'string' &&
                  (query.queryKey[0].includes('/line-item-budget-details') ||
                    query.queryKey[0].includes('/lib-activities') ||
                    query.queryKey[0].includes('/libs')),
              })
            } else {
              toast.error(generateSubmissionSummary(outcome))
            }

            setIsSubmitting(false)
            return
          } else {
            // Single quarterly allocation
            const numBudget = parseFloat(budget) || value.budget || 0
            if (isNaN(numBudget) || numBudget <= 0) {
              toast.error('Allocated budget must be greater than 0')
              return
            }

            const effectiveStart = value.startDate || startDate
            const effectiveEnd = value.endDate || endDate

            if (!effectiveStart || !effectiveEnd) {
              toast.error('Start date and end date are required')
              return
            }

            if (new Date(effectiveEnd) < new Date(effectiveStart)) {
              toast.error('End date must be on or after start date')
              return
            }

            setIsSubmitting(true)

            const singlePeriod = [
              {
                period: selectedQuarter || 'Quarterly',
                startDate: new Date(effectiveStart),
                endDate: new Date(effectiveEnd),
                budget: numBudget,
                payload: {
                  lineItemBudgetId: libId,
                  lineItemBudgetActivityId: libActivityId,
                  wfpObjectiveActivityExpenditureId: undefined,
                  objectId: finalObjectId,
                  description: value.description.trim() || undefined,
                  timelineType: 'quarterly',
                  startDate: formatDateToISO(new Date(effectiveStart)),
                  endDate: formatDateToISO(new Date(effectiveEnd)),
                  budget: numBudget,
                },
              },
            ]

            if (onSubmitOverride) {
              onSubmitOverride(value, singlePeriod)
              setIsSubmitting(false)
              onCreated?.()
              onClose?.()
              return
            }

            await mutateAsync({
              pathParams: {},
              payload: singlePeriod[0].payload,
            })

            toast.success('Line Item created successfully!')
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].includes('/line-item-budget-details') ||
                  query.queryKey[0].includes('/lib-activities') ||
                  query.queryKey[0].includes('/libs')),
            })
            setIsSubmitting(false)
            onCreated?.()
            onClose?.()
            return
          }
        } else if (currentTimeline === 'monthly') {
          // Monthly allocation path
          setIsSubmitting(true)
          const periods = generateMonthlyPeriodDetails(
            periodAllocation,
            activityStartDate,
          )

          if (periods.length === 0) {
            toast.error('At least one month with budget > 0 is required')
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

          const submitPayloads = periods.map((period) => ({
            period: period.period,
            payload: {
              lineItemBudgetId: libId,
              lineItemBudgetActivityId: libActivityId,
              wfpObjectiveActivityExpenditureId: undefined,
              objectId: finalObjectId,
              description: value.description.trim() || undefined,
              timelineType: 'monthly',
              startDate: formatDateToISO(period.startDate),
              endDate: formatDateToISO(period.endDate),
              budget: period.budget,
            },
          }))

          const outcome = await submitConcurrentPeriodAllocations(
            async (p) => {
              await mutateAsync({ pathParams: {}, payload: p.payload })
            },
            submitPayloads,
          )

          setSubmissionOutcome(outcome)

          if (outcome.failureCount === 0) {
            toast.success(generateSubmissionSummary(outcome))
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].includes('/line-item-budget-details') ||
                  query.queryKey[0].includes('/lib-activities') ||
                  query.queryKey[0].includes('/libs')),
            })
            onCreated?.()
            onClose?.()
          } else if (outcome.successCount > 0) {
            toast.warning(generateSubmissionSummary(outcome))
            void queryClient.invalidateQueries({
              predicate: (query) =>
                typeof query.queryKey[0] === 'string' &&
                (query.queryKey[0].includes('/line-item-budget-details') ||
                  query.queryKey[0].includes('/lib-activities') ||
                  query.queryKey[0].includes('/libs')),
            })
          } else {
            toast.error(generateSubmissionSummary(outcome))
          }
          setIsSubmitting(false)
        } else {
          // Fallback
          const numBudget = parseFloat(budget) || value.budget || 0
          await mutateAsync({
            pathParams: {},
            payload: {
              lineItemBudgetId: libId,
              lineItemBudgetActivityId: libActivityId,
              wfpObjectiveActivityExpenditureId: undefined,
              objectId: finalObjectId,
              description: value.description.trim() || undefined,
              timelineType: value.timelineType || undefined,
              startDate: value.startDate || undefined,
              endDate: value.endDate || undefined,
              budget: numBudget,
            },
          })
          toast.success('Line Item created successfully!')
          void queryClient.invalidateQueries({
            predicate: (query) =>
              typeof query.queryKey[0] === 'string' &&
              (query.queryKey[0].includes('/line-item-budget-details') ||
                query.queryKey[0].includes('/lib-activities') ||
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
      timelineType,
      budget,
      startDate,
      endDate,
      libId,
      libActivityId,
      mutateAsync,
      queryClient,
      onCreated,
      onClose,
      isSplitMode,
      coveredQuarters,
      splitBudgets,
      selectedQuarter,
      onSubmitOverride,
      periodAllocation,
      activityStartDate,
      expenditureTypes,
      descendantExpenditureItems,
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

  const isLoading = isPending || isSubmitting
  const isLoadingTypes = isLoadingObjects

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
              Type of Expenditure <span className="text-red-500">*</span>
            </Label>
            <Select
              value={field.state.value}
              onValueChange={(value) => {
                field.handleChange(value)
                setSelectedParentId(value)
                form.setFieldValue('itemOfExpenditureId', '')

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

      {/* Select Item of Expenditure */}
      {selectedParentObject && descendantExpenditureItems.length > 0 && (
        <form.Field
          name="itemOfExpenditureId"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="font-medium">
                Select Item of Expenditure <span className="text-red-500">*</span>
              </Label>
              <ExpenditureItemCombobox
                id={field.name}
                items={descendantExpenditureItems}
                value={field.state.value || ''}
                onValueChange={(val, selectedDescendant) => {
                  field.handleChange(val)

                  if (selectedDescendant) {
                    const currentDesc = form.getFieldValue('description') as string | undefined
                    const isEmpty = !currentDesc || currentDesc.trim() === ''
                    const matchesPreviousAuto = autoInheritedName && currentDesc === autoInheritedName
                    const matchesAnyObjName = descendantExpenditureItems.some((i) => i.name === currentDesc)

                    if (isEmpty || matchesPreviousAuto || matchesAnyObjName) {
                      form.setFieldValue('description', selectedDescendant.name || '')
                      setAutoInheritedName(selectedDescendant.name || null)
                    }
                  } else {
                    setAutoInheritedName(null)
                  }
                }}
                disabled={isLoading || isLoadingTypes}
                isLoading={isLoadingTypes}
                placeholder="Select item of expenditure"
                hasError={Boolean(field.state.meta.errors.length)}
              />
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
                Description <span className="text-red-500">*</span>
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

      {/* Budget and Timeline Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <form.Field
          name="budget"
          children={(field) => (
            <div className="space-y-1.5">
              <Label htmlFor={field.name} className="text-xs font-semibold text-gray-700">
                Allocated Budget (₱) <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="number"
                step="0.01"
                min="0.01"
                value={budget}
                onChange={(e) => {
                  const val = e.target.value
                  setBudget(val)
                  field.handleChange(parseFloat(val) || 0)
                }}
                placeholder="0.00"
                className="text-sm font-semibold"
                disabled={isLoading}
                required
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        <form.Field
          name="timelineType"
          children={(field) => (
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Timeline Type
              </Label>
              <Select
                value={field.state.value || timelineType}
                onValueChange={(val) => {
                  field.handleChange(val)
                  setTimelineType(val)
                }}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timeline type..." />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />
      </div>

      {/* Quarter & Date Selectors for Quarterly Timeline */}
      {timelineType === 'quarterly' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-gray-700">
                Quarter Preset
              </Label>
              <Select
                value={selectedQuarter}
                onValueChange={handleQuarterChange}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pick quarter..." />
                </SelectTrigger>
                <SelectContent>
                  {spansMultipleQuarters && (
                    <SelectItem
                      value="MULTI"
                      disabled
                      className="font-semibold text-amber-700 bg-amber-50/80"
                    >
                      Spans {coveredQuarters.map((q) => q.id).join(' & ')}
                    </SelectItem>
                  )}
                  {STANDARD_QUARTERS.map((q) => (
                    <SelectItem key={q.id} value={q.id}>
                      {q.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <form.Field
              name="startDate"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-semibold text-gray-700">
                    Start Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      const newSDate = e.target.value
                      setStartDate(newSDate)
                      field.handleChange(newSDate)
                      const covered = getCoveredQuarters(newSDate, endDate)
                      if (covered.length === 1) {
                        setSelectedQuarter(covered[0].id)
                        setIsSplitMode(false)
                      } else if (covered.length > 1) {
                        setSelectedQuarter('MULTI')
                      } else {
                        setSelectedQuarter('')
                        setIsSplitMode(false)
                      }
                    }}
                    disabled={isLoading}
                    required
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />

            <form.Field
              name="endDate"
              children={(field) => (
                <div className="space-y-1.5">
                  <Label htmlFor={field.name} className="text-xs font-semibold text-gray-700">
                    End Date <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id={field.name}
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      const newEDate = e.target.value
                      setEndDate(newEDate)
                      field.handleChange(newEDate)
                      const covered = getCoveredQuarters(startDate, newEDate)
                      if (covered.length === 1) {
                        setSelectedQuarter(covered[0].id)
                        setIsSplitMode(false)
                      } else if (covered.length > 1) {
                        setSelectedQuarter('MULTI')
                      } else {
                        setSelectedQuarter('')
                        setIsSplitMode(false)
                      }
                    }}
                    disabled={isLoading}
                    required
                  />
                  <FieldInfo field={field} />
                </div>
              )}
            />
          </div>

          {/* Multi-Quarter Split Banner & Breakdown */}
          {spansMultipleQuarters && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-semibold text-amber-900">
                      Multi-Quarter Allocation ({coveredQuarters.map((q) => q.id).join(' & ')})
                    </h4>
                    <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
                      This allocation spans {startDate} to {endDate}. Split it across quarters to align with the quarterly matrix columns.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant={isSplitMode ? 'default' : 'outline'}
                  onClick={handleToggleSplitMode}
                  className={`h-7 px-2.5 text-xs font-medium shrink-0 ${
                    isSplitMode
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'border-amber-300 text-amber-800 hover:bg-amber-100 bg-white'
                  }`}
                >
                  <Split className="h-3.5 w-3.5 mr-1" />
                  {isSplitMode ? 'Cancel Split' : 'Split Across Quarters'}
                </Button>
              </div>

              {/* Split Breakdown */}
              {isSplitMode && (
                <div className="bg-white rounded-lg border border-amber-200 p-3 space-y-3 pt-2.5">
                  <div className="flex items-center justify-between border-b pb-2">
                    <span className="text-xs font-bold text-gray-800">
                      Quarterly Budget Breakdown
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleEqualizeBudgets}
                      className="h-6 text-[11px] text-blue-600 hover:text-blue-800 font-medium px-2"
                    >
                      Divide Equally
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {coveredQuarters.map((q) => (
                      <div
                        key={q.id}
                        className="bg-gray-50/80 rounded-lg p-2.5 border border-gray-100 space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-gray-800">
                            {q.label}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            {q.startDate} – {q.endDate}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2 text-xs font-semibold text-gray-400">
                            ₱
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={splitBudgets[q.id] || ''}
                            onChange={(e) => {
                              const val = e.target.value
                              setSplitBudgets((prev) => ({
                                ...prev,
                                [q.id]: val,
                              }))
                            }}
                            className="h-8 pl-6 text-xs font-semibold"
                            placeholder="0.00"
                            required
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-gray-100">
                    <span className="text-gray-500 text-[11px]">
                      Sum of quarters:{' '}
                      <strong
                        className={`font-semibold ${
                          Math.abs(splitSum - totalBudgetNum) > 0.01
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}
                      >
                        {formatCurrencyPHP(splitSum)}
                      </strong>
                    </span>
                    <span className="text-gray-500 text-[11px]">
                      Total Budget:{' '}
                      <strong className="text-gray-900 font-semibold">
                        {formatCurrencyPHP(totalBudgetNum)}
                      </strong>
                    </span>
                  </div>

                  {Math.abs(splitSum - totalBudgetNum) > 0.01 && (
                    <p className="text-[11px] text-amber-700 font-medium">
                      ⚠️ The sum of quarters ({formatCurrencyPHP(splitSum)}) differs from the total budget ({formatCurrencyPHP(totalBudgetNum)}).
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Monthly Period Allocation Panel */}
      {timelineType === 'monthly' && (
        <PeriodAllocationPanel
          timelineType="monthly"
          allocation={periodAllocation}
          onAllocationChange={(alloc) =>
            handlePeriodAllocationChange(alloc as MonthlyAllocation)
          }
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
