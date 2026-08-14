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

import { getWFPObjectiveActivityRequest } from '../../line-item-budget/handlers/getWFPObjectiveActivityRequest'
import { useSearch } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Trash2, Edit2, Check, X, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

const useWfpObjectiveActivity = createQueryHookFromTemplate(
  getWFPObjectiveActivityRequest,
)
const useGetObjects = createQueryHookFromTemplate(getObjectsRequest)

// Hook for fetching child objects based on parent selection
const useGetChildObjects = (parentId: string | null) => {
  return useGetObjects({
    pathParams: {},
    queryParams: {
      filters: parentId ? `parentId==${parentId}` : 'parentId==null',
    },
  })
}

// Validation schema aligned with API nullable fields
const createLineItemBudgetDetailsSchema = z
  .object({
    objectId: z.string().min(1, 'Type of Expenditure is required'),
    itemOfExpenditureId: z.string().optional(),
    wfpObjectiveActivityExpenditureId: z.string().optional(),
    description: z.string().optional().or(z.string().min(1)),
    unitQuantity: z.number().optional(),
    unitCost: z.number().optional(),
    startDate: z.string().min(1, 'Start Date is required'),
    endDate: z.string().min(1, 'End Date is required'),
    timelineType: z.string().min(1, 'Timeline Type is required'),
    budget: z.number(),
  })
  .refine(
    (data) => {
      // Validate that startDate < endDate
      if (data.startDate && data.endDate) {
        const start = new Date(data.startDate).getTime()
        const end = new Date(data.endDate).getTime()
        return start < end
      }
      return true
    },
    {
      message: 'Start Date must be before End Date',
      path: ['endDate'],
    },
  )

export type CreateWfpLineItemBudgetDetailsFormValues = z.infer<
  typeof createLineItemBudgetDetailsSchema
>

// Type for line items in the table with temp ID for editing/deletion
export interface LineItemWithId
  extends CreateWfpLineItemBudgetDetailsFormValues {
  _tempId: string
}

interface LineItemBudgetDetailsDefaults {
  objectId: string
  itemOfExpenditureId?: string
  description?: string
  wfpObjectiveActivityExpenditureId?: string
  unitQuantity?: number
  unitCost?: number
  startDate: string
  endDate: string
  timelineType: string
  budget: number
}

// Helper to format date for API submission (ISO 8601 datetime)
const formatDateForSubmission = (
  dateString: string | undefined,
): string | undefined => {
  if (!dateString) return undefined
  try {
    const date = new Date(dateString)
    // Ensure valid date
    if (isNaN(date.getTime())) return undefined
    return date.toISOString()
  } catch {
    return undefined
  }
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
  wfpObjectiveActivityId?: string
  onCreated?: () => void
  onClose?: () => void
  setForm?: (form: WfpLineItemBudgetDetailsFormApi) => void
  scope?: 'Activity' | 'Project'
  activityStartDate?: Date // For period-based allocation date calculations
  activityEndDate?: Date // For period-based allocation date calculations
  activityBudget?: number // For validating period sum
  onSubmitOverride?: (lineItems: LineItemWithId[]) => void
  hideFooterButtons?: boolean
  setFormController?: (controller: WfpFormController) => void
}

const useCreateLineItemBudgetDetails = createMutationHookFromTemplate(
  createLineItemBudgetDetailsRequest,
)

export default function CreateWfpLineItemBudgetDetailsForm({
  libId,
  wfpObjectiveActivityId: wfpObjectiveActivityIdProp,
  onCreated,
  onClose,
  setForm,
  scope,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activityStartDate: _activityStartDate = new Date(),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activityEndDate: _activityEndDate = new Date(),
  onSubmitOverride,
  hideFooterButtons = false,
  setFormController,
}: CreateWfpLineItemBudgetDetailsFormProps) {
  const queryClient = useQueryClient()
  const { mutateAsync, isPending } = useCreateLineItemBudgetDetails()

  // State for pending line items to be submitted
  const [lineItems, setLineItems] = useState<LineItemWithId[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isSubmittingAll, setIsSubmittingAll] = useState(false)
  const [submissionResults, setSubmissionResults] = useState<
    Array<{ tempId: string; success: boolean; error?: string }>
  >([])
  const [inheritedDescription, setInheritedDescription] = useState<
    string | null
  >(null)
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
          const startDateFormatted = formatDateForSubmission(item.startDate)
          const endDateFormatted = formatDateForSubmission(item.endDate)

          await mutateAsync({
            pathParams: {},
            payload: {
              lineItemBudgetId: libId,
              wfpObjectiveActivityExpenditureId:
                scope === 'Project'
                  ? undefined
                  : item.wfpObjectiveActivityExpenditureId || undefined,
              objectId: finalObjectId,
              description: item.description || undefined,
              unitQuantity: item.unitQuantity || undefined,
              unitCost: item.unitCost || undefined,
              startDate: startDateFormatted,
              endDate: endDateFormatted,
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

      if (failureCount === 0) {
        toast.success(`All ${successCount} line items created successfully`)
        void queryClient.invalidateQueries({
          predicate: (query) =>
            typeof query.queryKey[0] === 'string' &&
            query.queryKey[0].includes('/lib-activities'),
        })
        setLineItems([])
        setSubmissionResults([])
        onCreated?.()
        onClose?.()
      } else {
        toast.error(
          `Submission complete: ${successCount} succeeded, ${failureCount} failed`,
        )
        setSubmissionResults(results)
      }
    } catch (error) {
      console.error('Error submitting line items:', error)
      toast.error('Failed to submit line items')
    } finally {
      setIsSubmittingAll(false)
    }
  }, [lineItems, libId, mutateAsync, queryClient, onCreated, onClose])


  const handleClearAll = useCallback(() => {
    if (window.confirm('Are you sure? All pending items will be lost.')) {
      setLineItems([])
      setSubmissionResults([])
      setEditingId(null)
    }
  }, [])

  // Expose controller to parent dialog
  useEffect(() => {
    setFormController?.({
      submitAll: submitAllLineItems,
      clearAll: handleClearAll,
      pendingItems: lineItems,
      isSubmitting: isSubmittingAll,
    })
  }, [setFormController, submitAllLineItems, handleClearAll, lineItems, isSubmittingAll])

  const search = useSearch({ strict: false }) as { wfpObjectiveActivityId?: string }
  const wfpObjectiveActivityId = search?.wfpObjectiveActivityId

  const finalWfpObjectiveActivityId = wfpObjectiveActivityIdProp || wfpObjectiveActivityId

  const { data: wfpObjectiveActivityData } = useWfpObjectiveActivity({
    pathParams: { id: finalWfpObjectiveActivityId || '' },
    queryParams: {},
    enabled: !!finalWfpObjectiveActivityId,
  })

  const { data: rootObjectsResponse, isLoading: isLoadingRootObjects } = useGetObjects({
    pathParams: {},
    queryParams: {
      filters: `parentId==null`,
    },
  })

  // Locate the Expenses root object
  const expensesRootObject = useMemo(() => {
    return rootObjectsResponse?.data?.find(
      (item) =>
        item.code === 'CLS:Expenses' ||
        item.name?.toLowerCase() === 'expenses' ||
        item.code?.startsWith('5'),
    )
  }, [rootObjectsResponse?.data])

  // Fetch expenditure types (children of Expenses)
  const { data: expenditureTypesResponse, isLoading: isLoadingExpenditureTypes } = useGetObjects({
    pathParams: {},
    queryParams: {
      filters: expensesRootObject ? `parentId==${expensesRootObject.id}` : 'parentId==null',
    },
  })

  const expenditureTypes = useMemo(() => {
    if (expensesRootObject && expenditureTypesResponse?.data) {
      return expenditureTypesResponse.data
    }
    return []
  }, [expensesRootObject, expenditureTypesResponse?.data])

  // console.log('wfpObjectiveActivityData', wfpObjectiveActivityData)
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null)

  // Create a lookup map of expenditures by ID for auto-populating inherited fields
  const expendituresLookup = useMemo(() => {
    const lookup: Record<
      string,
      { quantity: number; unitCost: number; itemDescription: string | null }
    > = {}
    wfpObjectiveActivityData?.data?.wfpObjectiveActivityExpenditures?.forEach(
      (expenditure) => {
        lookup[expenditure.id] = {
          quantity: expenditure.quantity,
          unitCost: expenditure.unitCost,
          itemDescription: expenditure.itemDescription || null,
        }
      },
    )
    return lookup
  }, [wfpObjectiveActivityData?.data?.wfpObjectiveActivityExpenditures])

  const lineItemDefaults: LineItemBudgetDetailsDefaults = {
    objectId: '',
    itemOfExpenditureId: undefined,
    description: undefined,
    unitQuantity: undefined,
    unitCost: undefined,
    startDate: '',
    endDate: '',
    timelineType: '',
    budget: 0,
  }

  // Handle form submission with concurrent period allocation logic
  const handleAddToList = useCallback(
    async (value: CreateWfpLineItemBudgetDetailsFormValues) => {
      try {
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

        // Check for duplicates by objectId + timelineType
        const isDuplicate = lineItems.some(
          (item) =>
            item.objectId === finalObjectId &&
            item.timelineType === value.timelineType,
        )

        if (isDuplicate) {
          toast.error(
            'This combination of Type of Expenditure and Timeline Type already exists',
          )
          return
        }

        // Validate that budget >= auto-calculated budget
        const calculatedBudget =
          (value.unitQuantity || 0) * (value.unitCost || 0)
        if (value.budget < calculatedBudget) {
          toast.error(
            `Budget must be at least ₱${calculatedBudget.toLocaleString(
              'en-PH',
              {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              },
            )}`,
          )
          return
        }

        // If editing, update the item; otherwise add new item
        if (editingId) {
          setLineItems((prev) =>
            prev.map((item) =>
              item._tempId === editingId
                ? {
                  ...value,
                  _tempId: editingId,
                }
                : item,
            ),
          )
          toast.success('Line item updated')
          setEditingId(null)
        } else {
          // Add new item with temp ID
          const newItem: LineItemWithId = {
            ...value,
            _tempId: `${Date.now()}-${Math.random()}`,
          }
          setLineItems((prev) => [...prev, newItem])
          toast.success('Line item added to list')
        }

        // Reset form
        form.reset()
        setSelectedParentId(null)
        setInheritedDescription(null)
        setEditingId(null)
      } catch (error) {
        console.error('Error processing line item:', error)
        toast.error('Failed to process line item')
      }
    },
    [lineItems, editingId, expenditureTypes],
  )

  const form = useLineItemBudgetDetailsFormInstance(
    lineItemDefaults,
    handleAddToList,
  )

  // Calculate auto budget based on unitQuantity * unitCost
  const autoCalculatedBudget = useMemo(() => {
    const unitQuantity = form.getFieldValue('unitQuantity') as
      | number
      | undefined
    const unitCost = form.getFieldValue('unitCost') as number | undefined
    if (unitQuantity !== undefined && unitCost !== undefined) {
      return unitQuantity * unitCost
    }
    return 0
  }, [form, form.getFieldValue('unitQuantity'), form.getFieldValue('unitCost')])


  // Handle deletion of a line item
  const handleDeleteLineItem = useCallback((tempId: string) => {
    setLineItems((prev) => prev.filter((item) => item._tempId !== tempId))
    setEditingId(null)
    toast.success('Line item removed')
  }, [])

  // Handle editing a line item
  const handleEditLineItem = useCallback(
    (item: LineItemWithId) => {
      // Populate form fields with item data
      form.setFieldValue('objectId', item.objectId)
      form.setFieldValue('itemOfExpenditureId', item.itemOfExpenditureId)
      form.setFieldValue(
        'wfpObjectiveActivityExpenditureId',
        item.wfpObjectiveActivityExpenditureId,
      )
      form.setFieldValue('description', item.description)
      form.setFieldValue('unitQuantity', item.unitQuantity)
      form.setFieldValue('unitCost', item.unitCost)
      form.setFieldValue('startDate', item.startDate)
      form.setFieldValue('endDate', item.endDate)
      form.setFieldValue('timelineType', item.timelineType)
      form.setFieldValue('budget', item.budget)
      setEditingId(item._tempId)
      setSelectedParentId(item.objectId)
      // Set the inherited description based on the expenditure
      if (item.wfpObjectiveActivityExpenditureId) {
        const expenditure =
          expendituresLookup[item.wfpObjectiveActivityExpenditureId]
        if (expenditure) {
          setInheritedDescription(expenditure.itemDescription)
        }
      }
    },
    [form, expendituresLookup],
  )

  // Cancel editing
  const handleCancelEdit = useCallback(() => {
    form.reset()
    setEditingId(null)
    setSelectedParentId(null)
    setInheritedDescription(null)
  }, [form])

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

  const isLoading = isPending
  const isLoadingTypes = isLoadingRootObjects || isLoadingExpenditureTypes

  return (
    <form
      id="create-line-item-budget-details-form"
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* wfpObjectiveActivityExpenditure selection - only for Activity scope */}
        {scope !== 'Project' && (
          <form.Field
            name="wfpObjectiveActivityExpenditureId"
            children={(field) => (
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor={field.name} className="font-medium">
                  WFP Objective Activity Expenditure
                </Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value) => {
                    field.handleChange(value)
                    // Auto-populate quantity, unitCost, and description from the selected expenditure
                    const expenditure = expendituresLookup[value]
                    if (expenditure) {
                      form.setFieldValue('unitQuantity', expenditure.quantity)
                      form.setFieldValue('unitCost', expenditure.unitCost)
                      // Set description from itemDescription, or empty string if null
                      form.setFieldValue(
                        'description',
                        expenditure.itemDescription || '',
                      )
                      setInheritedDescription(expenditure.itemDescription)
                      // Auto-calculate budget
                      const calculatedBudget =
                        expenditure.quantity * expenditure.unitCost
                      form.setFieldValue('budget', calculatedBudget)
                    }
                  }}
                  disabled={isPending || isLoadingTypes || editingId !== null}
                >
                  <SelectTrigger id={field.name} className="w-full text-xs">
                    <SelectValue
                      placeholder={
                        isLoadingTypes
                          ? 'Loading items...'
                          : 'Select WFP Objective Activity Expenditure'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {wfpObjectiveActivityData?.data?.wfpObjectiveActivityExpenditures.map(
                      (expenditure) => (
                        <SelectItem key={expenditure.id} value={expenditure.id}>
                          {expenditure.itemDescription}
                          {` ${expenditure.unitCost}`}
                        </SelectItem>
                      ),
                    ) || []}
                  </SelectContent>
                </Select>
                <FieldInfo field={field} />
              </div>
            )}
          />
        )}

        {/* Type of Expenditure Selection */}
        <form.Field
          name="objectId"
          children={(field) => (
            <div className={cn("space-y-2", (!selectedParentObject || selectedParentObject.childObjectCount === 0) && "md:col-span-2")}>
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
                }}
                disabled={isPending || isLoadingTypes}
              >
                <SelectTrigger id={field.name} className="w-full text-xs">
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
              <div className="space-y-2">
                <Label htmlFor={field.name} className="font-medium">
                  Select Item of Expenditure
                </Label>
                <Select
                  value={field.state.value || ''}
                  onValueChange={field.handleChange}
                  disabled={isLoading || isLoadingChildObjects}
                >
                  <SelectTrigger id={field.name} className="w-full text-xs">
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
          children={(field) => {
            const isInherited =
              inheritedDescription !== null &&
              inheritedDescription === field.state.value
            return (
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor={field.name} className="font-medium">
                    Description
                  </Label>
                  {isInherited && (
                    <span
                      className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                      title="Auto-populated from expenditure item"
                    >
                      Inherited
                    </span>
                  )}
                </div>
                <Input
                  id={field.name}
                  type="text"
                  placeholder={
                    inheritedDescription === null
                      ? 'Enter description (optional)'
                      : 'Auto-populated from expenditure'
                  }
                  value={field.state.value || ''}
                  onChange={(e) => field.handleChange(e.target.value)}
                  disabled={isLoading || (isInherited && editingId !== null)}
                  className="w-full text-xs"
                />
                <FieldInfo field={field} />
              </div>
            )
          }}
        />

        {/* Unit Quantity */}
        <form.Field
          name="unitQuantity"
          children={(field) => (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={field.name} className="font-medium">
                  Unit Quantity
                </Label>
                {scope !== 'Project' && (
                  <span
                    className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                    title="Auto-populated from expenditure. Cannot be modified."
                  >
                    Inherited (Read-only)
                  </span>
                )}
              </div>
              <Input
                id={field.name}
                type="number"
                placeholder="0"
                value={field.state.value || 0}
                onChange={(e) => {
                  const newQuantity = parseFloat(e.target.value) || 0
                  field.handleChange(newQuantity)
                  // Auto-calculate budget when scope is Project
                  if (scope === 'Project') {
                    const unitCost =
                      (form.getFieldValue('unitCost') as number | undefined) || 0
                    form.setFieldValue('budget', newQuantity * unitCost)
                  }
                }}
                disabled={scope !== 'Project' || isLoading}
                className={cn(
                  'w-full text-xs',
                  scope !== 'Project' && 'bg-slate-50 cursor-not-allowed text-slate-500'
                )}
                step="0.01"
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
              <div className="flex items-center gap-2">
                <Label htmlFor={field.name} className="font-medium">
                  Unit Cost
                </Label>
                {scope !== 'Project' && (
                  <span
                    className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full"
                    title="Auto-populated from expenditure. Cannot be modified."
                  >
                    Inherited (Read-only)
                  </span>
                )}
              </div>
              <Input
                id={field.name}
                type="number"
                placeholder="0"
                value={field.state.value || 0}
                onChange={(e) => {
                  const newCost = parseFloat(e.target.value) || 0
                  field.handleChange(newCost)
                  // Auto-calculate budget when scope is Project
                  if (scope === 'Project') {
                    const unitQuantity =
                      (form.getFieldValue('unitQuantity') as
                        | number
                        | undefined) || 0
                    form.setFieldValue('budget', unitQuantity * newCost)
                  }
                }}
                disabled={scope !== 'Project' || isLoading}
                className={cn(
                  'w-full text-xs',
                  scope !== 'Project' && 'bg-slate-50 cursor-not-allowed text-slate-500'
                )}
                step="0.01"
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Start Date */}
        <form.Field
          name="startDate"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Start Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="w-full text-xs"
                required
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* End Date */}
        <form.Field
          name="endDate"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                End Date <span className="text-red-500">*</span>
              </Label>
              <Input
                id={field.name}
                type="datetime-local"
                value={field.state.value || ''}
                onChange={(e) => field.handleChange(e.target.value)}
                disabled={isLoading}
                className="w-full text-xs"
                required
              />
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Timeline Type */}
        <form.Field
          name="timelineType"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="font-medium">
                Timeline Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={field.state.value}
                onValueChange={field.handleChange}
                disabled={isLoading}
              >
                <SelectTrigger id={field.name} className="w-full text-xs">
                  <SelectValue placeholder="Select timeline type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERIOD">Period</SelectItem>
                  <SelectItem value="FIXED">Fixed</SelectItem>
                  <SelectItem value="ONGOING">Ongoing</SelectItem>
                </SelectContent>
              </Select>
              <FieldInfo field={field} />
            </div>
          )}
        />

        {/* Budget */}
        <form.Field
          name="budget"
          children={(field) => {
            const currentBudget = field.state.value || 0
            const isBudgetValid = currentBudget >= autoCalculatedBudget
            const isProjectScope = scope === 'Project'

            return (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={field.name} className="font-medium">
                      Budget
                      {isProjectScope ? (
                        <span className="text-xs text-gray-500 ml-1">
                          (Auto-calculated)
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500 ml-1">
                          (Can override)
                        </span>
                      )}
                    </Label>
                    {!isProjectScope && (
                      <span
                        className="text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full"
                        title="Can be overridden but must be >= auto-calculated amount"
                      >
                        Calculated: ₱
                        {autoCalculatedBudget.toLocaleString('en-PH', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
                  </div>
                </div>
                <Input
                  id={field.name}
                  type="number"
                  placeholder="0"
                  value={currentBudget}
                  onChange={(e) => {
                    const newBudget = parseFloat(e.target.value) || 0
                    field.handleChange(newBudget)
                  }}
                  disabled={isProjectScope || isLoading || isSubmittingAll}
                  className={cn(
                    'w-full text-xs',
                    isProjectScope && 'bg-slate-50 cursor-not-allowed text-slate-500',
                    !isProjectScope && !isBudgetValid && 'border-red-500 focus:ring-red-500'
                  )}
                  step="0.01"
                />
                {!isProjectScope && !isBudgetValid && (
                  <p className="text-[10px] text-red-600 font-semibold mt-1">
                    Budget must be at least ₱
                    {autoCalculatedBudget.toLocaleString('en-PH', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                )}
                <FieldInfo field={field} />
              </div>
            )
          }}
        />
      </div>

      {/* Form Action Buttons */}
      <div className="flex gap-2 justify-end pt-4 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancelEdit}
          disabled={!editingId || isSubmittingAll}
          className={cn('text-xs h-9 gap-1.5', !editingId && 'hidden')}
        >
          <X className="w-3.5 h-3.5" />
          Cancel Edit
        </Button>
        <Button
          type="submit"
          disabled={isLoading || isSubmittingAll}
          className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-9 gap-1.5"
        >
          {editingId ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Update Item
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5" />
              Add to List
            </>
          )}
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
                  const itemObject = objectsResponse?.data?.find(
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
                        isItemFailed && 'bg-red-50/70 hover:bg-red-50'
                      )}
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {itemObject?.name}{' '}
                        {itemObject?.code ? `(${itemObject.code})` : ''}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.description || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                            item.timelineType === 'PERIOD'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : item.timelineType === 'FIXED'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          )}
                        >
                          {item.timelineType}
                        </Badge>
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
                            onClick={() => handleEditLineItem(item)}
                            disabled={isSubmittingAll}
                            title="Edit this item"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
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
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider mb-2">Submission Status:</h4>
              <ul className="space-y-1.5 text-xs">
                {submissionResults.map((result) => {
                  const item = lineItems.find(
                    (i) => i._tempId === result.tempId,
                  )
                  const itemObject = objectsResponse?.data?.find(
                    (obj) => obj.id === item?.objectId,
                  )
                  return (
                    <li
                      key={result.tempId}
                      className={cn(
                        'flex items-center gap-1.5 font-semibold',
                        result.success ? 'text-green-600' : 'text-red-600'
                      )}
                    >
                      <span>{result.success ? '✓' : '✗'}</span>
                      <span>{itemObject?.name}</span>
                      {result.error && <span className="text-[10px] font-normal text-slate-500">({result.error})</span>}
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
                Submit All Items
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  )
}
