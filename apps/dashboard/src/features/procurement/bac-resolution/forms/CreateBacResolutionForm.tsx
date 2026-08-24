import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  FileText,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  Building2,
  Wallet,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  FileSpreadsheet,
  PackageCheck,
  Plus,
  Trash2,
  GripVertical,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type {
  EligibleAppForProcurement,
  EligibleAppItem,
  EligibleConsolidatedPR,
  ProcurementSourceType,
  WhereasClauseTemplate,
} from '../types'
import {
  useEligibleAppsForProcurement,
  useEligibleConsolidatedPRs,
  useWhereasClauseTemplates,
  useUsers,
  useCreateWhereasClauseTemplate,
} from '../handlers/hooks'
import FieldInfo from '@/components/FieldInfo'
import type { User } from '@/services/api/users'
import type { CreateBacResolutionPayload, WhereasClauses } from '../handlers/createBacResolutionRequest'
import { CreateEditWhereasClauseDialog } from '../dialogs/CreateEditWhereasClauseDialog'
import { WhereasClausePickerModal } from '../dialogs/WhereasClausePickerModal'

export const createBacResolutionSchema = z.object({
  appItemId: z.string().optional(),
  consolidatedPRId: z.string().optional(),
  title: z.string().min(1, 'Title is required.'),
  abc: z.number().min(0, 'ABC must be at least 0.'),
  resolutionType: z.string().min(1, 'Resolution type is required.'),
  resolutionNumber: z.string().min(1, 'Resolution number is required.'),
  dateResolved: z.string().min(1, 'Date resolved is required.'),
  resolvedLocation: z.string().optional(),
  whereasClauses: z
    .array(z.object({
      whereasClauseId: z.string(),
      order: z.number(),
    }))
    .min(1, 'At least one WHEREAS clause must be selected.'),
  endUserRepresentativeId: z.string().optional(),
  techRepresentativeId: z.string().optional(),
})

export type CreateBacResolutionFormValues = z.infer<
  typeof createBacResolutionSchema
>



export interface CreateBacResolutionWizardRef {
  getFormValues: () => CreateBacResolutionFormValues | null
  getCurrentStep: () => 1 | 2 | 3
  isSubmitting: () => boolean
  nextStep: () => Promise<void>
  backStep: () => void
  submit: () => Promise<void>
}

interface CreateBacResolutionFormProps {
  onSubmit: (values: CreateBacResolutionPayload) => Promise<void> | void
  onCancel?: () => void
  initialValues?: Partial<CreateBacResolutionPayload>
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
  currentStep?: 1 | 2 | 3
  setCurrentStep?: React.Dispatch<React.SetStateAction<1 | 2 | 3>>
  onStepChange?: (step: 1 | 2 | 3) => void
  onCanProceedChange?: (canProceed: boolean) => void
  onSuccess?: () => void
}


export const CreateBacResolutionForm = forwardRef<
  CreateBacResolutionWizardRef,
  CreateBacResolutionFormProps
>(
  (
    {
      onSubmit,
      initialValues,
      isLoading = false,
      onDirtyChange,
      formId,
      currentStep: externalCurrentStep,
      setCurrentStep: externalSetCurrentStep,
      onCanProceedChange,
      onSuccess,
    },
    ref,
  ) => {
    const [internalCurrentStep, setInternalCurrentStep] = useState<1 | 2 | 3>(1)
    const currentStep = externalCurrentStep ?? internalCurrentStep
    const setCurrentStep = externalSetCurrentStep ?? setInternalCurrentStep

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    const [selectedSourceType, setSelectedSourceType] =
      useState<ProcurementSourceType | null>(null)

    const [selectedAppItem, setSelectedAppItem] =
      useState<EligibleAppItem | null>(null)

    const [selectedConsolidatedPr, setSelectedConsolidatedPr] =
      useState<EligibleConsolidatedPR | null>(null)

    const { data: bacResolutionWhereasClauses, isPending: isWhereasPending } =
      useWhereasClauseTemplates({
        pathParams: {},
        queryParams: {},
      })

    const [isWhereasPickerOpen, setIsWhereasPickerOpen] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const whereasTemplates = useMemo<WhereasClauseTemplate[]>(() => {
      if (!bacResolutionWhereasClauses) return []
      if (Array.isArray(bacResolutionWhereasClauses.data)) {
        return bacResolutionWhereasClauses.data
      }
      if (Array.isArray(bacResolutionWhereasClauses)) {
        return bacResolutionWhereasClauses
      }
      return []
    }, [bacResolutionWhereasClauses])

    const derivedTitle = useMemo(() => {
      if (selectedSourceType === 'AppItem' && selectedAppItem) {
        return (
          selectedAppItem.ppmpItemName ||
          selectedAppItem.description ||
          selectedAppItem.remarks ||
          ''
        )
      }
      if (selectedSourceType === 'ConsolidatedPr' && selectedConsolidatedPr) {
        return (
          selectedConsolidatedPr.projectName ||
          selectedConsolidatedPr.description
        )
      }
      return ''
    }, [selectedSourceType, selectedAppItem, selectedConsolidatedPr])

    const inheritedAbc = useMemo(() => {
      if (selectedSourceType === 'AppItem' && selectedAppItem) {
        return selectedAppItem.effectiveABC
      }
      if (selectedSourceType === 'ConsolidatedPr' && selectedConsolidatedPr) {
        return selectedConsolidatedPr.totalAmount
      }
      return 0
    }, [selectedSourceType, selectedAppItem, selectedConsolidatedPr])

    const { data: usersData, isPending: isUsersLoading } = useUsers({
      pathParams: {},
      queryParams: { PageSize: 100 },
    })

    const users = useMemo<User[]>(() => {
      if (!usersData) return []
      if (Array.isArray(usersData.data)) return usersData.data
      if (Array.isArray(usersData)) return usersData
      return []
    }, [usersData])

    const [isCreateWhereasModalOpen, setIsCreateWhereasModalOpen] = useState(false)
    const createWhereasMutation = useCreateWhereasClauseTemplate()

    const handleCreateCustomWhereas = async (name: string, body: string) => {
      const created = await createWhereasMutation.mutateAsync({
        pathParams: {},
        payload: { name, body },
      })
      const currentSelected: WhereasClauses[] = form.getFieldValue('whereasClauses') || []
      form.setFieldValue('whereasClauses', [
        ...currentSelected,
        { whereasClauseId: created.id, order: currentSelected.length },
      ])
      toast.success('Custom WHEREAS Clause created and added to resolution.')
    }

    const defaultResNumber = `BAC-RES-2026-${Math.floor(
      100 + Math.random() * 900,
    )}`

    const initialFormValues: CreateBacResolutionFormValues = {
      appItemId: initialValues?.appItemId || undefined,
      consolidatedPRId: initialValues?.consolidatedPRId || undefined,
      title: initialValues?.title ?? derivedTitle ?? '',
      abc: initialValues?.abc ?? inheritedAbc ?? 0,
      resolutionType: initialValues?.resolutionType ?? 'award-recommendation',
      resolutionNumber:
        initialValues?.resolutionNumber ??
        defaultResNumber,
      dateResolved:
        initialValues?.dateResolved ??
        new Date().toISOString().split('T')[0],
      resolvedLocation: initialValues?.resolvedLocation || '',
      whereasClauses: initialValues?.whereasClauses || [],
      endUserRepresentativeId: initialValues?.endUserRepresentativeId || undefined,
      techRepresentativeId: initialValues?.techRepresentativeId || undefined,
    }

    const form = useForm({
      defaultValues: initialFormValues,
      validators: {
        onChange: createBacResolutionSchema,
      },
      onSubmit: async ({ value }) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
          const isoDate = value.dateResolved
            ? new Date(value.dateResolved).toISOString()
            : new Date().toISOString()

          const payload: CreateBacResolutionPayload = {
            sourceType:
              selectedSourceType === 'AppItem' ? 'APPItem' : 'ConsolidatedPR',
            appItemId:
              selectedSourceType === 'AppItem'
                ? value.appItemId || selectedAppItem?.id || undefined
                : undefined,
            consolidatedPRId:
              selectedSourceType === 'ConsolidatedPr'
                ? value.consolidatedPRId || selectedConsolidatedPr?.id || undefined
                : undefined,
            title: value.title,
            abc: value.abc,
            resolutionType: value.resolutionType,
            resolutionNumber: value.resolutionNumber,
            dateResolved: isoDate,
            resolvedLocation: value.resolvedLocation || undefined,
            whereasClauses: (value.whereasClauses || []).map((item, index) => ({
              whereasClauseId: item.whereasClauseId,
              order: index,
            })),
            endUserRepresentativeId: value.endUserRepresentativeId || undefined,
            techRepresentativeId: value.techRepresentativeId || undefined,
          }

          await onSubmit(payload)
          setSubmitError(null)
          onDirtyChange?.(false)
          onSuccess?.()
        } catch (error) {
          const errMsg =
            error instanceof Error ? error.message : 'Failed to submit BAC Resolution'
          setSubmitError(errMsg)
          toast.error(errMsg)
        } finally {
          setIsSubmitting(false)
        }
      },
    })

    // Sync title & ABC when source selection changes
    useEffect(() => {
      if (derivedTitle) {
        form.setFieldValue('title', derivedTitle)
      }
      form.setFieldValue('abc', inheritedAbc)
    }, [derivedTitle, inheritedAbc, form])

    // Update parent canProceed status based on step requirements
    useEffect(() => {
      if (currentStep === 1) {
        onCanProceedChange?.(selectedSourceType !== null)
      } else if (currentStep === 2) {
        const canProceed =
          (selectedSourceType === 'AppItem' && selectedAppItem !== null) ||
          (selectedSourceType === 'ConsolidatedPr' &&
            selectedConsolidatedPr !== null)
        onCanProceedChange?.(canProceed)
      } else if (currentStep === 3) {
        onCanProceedChange?.(true)
      }
    }, [
      currentStep,
      selectedSourceType,
      selectedAppItem,
      selectedConsolidatedPr,
      onCanProceedChange,
    ])

    useEffect(() => {
      onDirtyChange?.(form.state.isDirty || currentStep > 1)
    }, [form.state.isDirty, currentStep, onDirtyChange])

    const handleNextStep = async () => {
      if (currentStep === 1) {
        if (!selectedSourceType) {
          toast.error('Please select a procurement source type')
          return
        }
        setCurrentStep(2)
      } else if (currentStep === 2) {
        const hasSelection =
          (selectedSourceType === 'AppItem' && selectedAppItem !== null) ||
          (selectedSourceType === 'ConsolidatedPr' &&
            selectedConsolidatedPr !== null)
        if (!hasSelection) {
          toast.error('Please select a source record to proceed')
          return
        }
        setCurrentStep(3)
      }
    }

    const handleBackStep = () => {
      if (currentStep > 1) {
        setCurrentStep((prev) => (prev === 1 ? 1 : prev - 1) as 1 | 2 | 3)
      }
    }

    const handleSubmit = async () => {
      setSubmitError(null)
      await form.handleSubmit()
    }

    // Expose methods via ref
    useImperativeHandle(
      ref,
      () => ({
        getFormValues: () => {
          return form.state.values as CreateBacResolutionFormValues
        },
        getCurrentStep: () => currentStep,
        isSubmitting: () => isSubmitting,
        nextStep: handleNextStep,
        backStep: handleBackStep,
        submit: handleSubmit,
      }),
      [currentStep, isSubmitting, form.state.values, selectedSourceType, selectedAppItem, selectedConsolidatedPr],
    )

    return (
      <div className="space-y-6">
        {selectedSourceType}
        {/* Step Indicator Header */}
        <div className="flex items-center justify-center gap-2 py-2 border-b border-default-200">
          {[
            { step: 1, label: 'Source Type' },
            { step: 2, label: 'Source Record' },
            { step: 3, label: 'Resolution Details' },
          ].map(({ step, label }) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center font-semibold text-xs transition-colors',
                  currentStep === step
                    ? 'bg-primary text-primary-foreground ring-2 ring-primary/20'
                    : currentStep > step
                      ? 'bg-emerald-600 text-white'
                      : 'bg-muted text-muted-foreground',
                )}
              >
                {currentStep > step ? '✓' : step}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:inline-block',
                  currentStep === step
                    ? 'text-primary font-bold'
                    : currentStep > step
                      ? 'text-emerald-700'
                      : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
              {step < 3 && (
                <div
                  className={cn(
                    'w-6 sm:w-10 h-0.5 transition-colors',
                    currentStep > step ? 'bg-emerald-500' : 'bg-muted',
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* STEP 1: SELECT SOURCE TYPE */}
        {currentStep === 1 && (
          <SourceTypeSelectorStep
            selectedSourceType={selectedSourceType}
            onSelectSourceType={(type) => {
              setSelectedSourceType(type)
              setSelectedAppItem(null)
              setSelectedConsolidatedPr(null)
            }}
          />
        )}

        {/* STEP 2: SELECT SOURCE RECORD */}
        {currentStep === 2 && selectedSourceType && (
          <SourceRecordPickerStep
            sourceType={selectedSourceType}
            selectedAppItem={selectedAppItem}
            selectedConsolidatedPr={selectedConsolidatedPr}
            onSelectAppItem={(parent, item) => {
              setSelectedAppItem(item)
            }}
            onSelectConsolidatedPr={setSelectedConsolidatedPr}
          />
        )}

        {/* STEP 3: BAC RESOLUTION DETAILS FORM */}
        {currentStep === 3 && (
          <form
            id={formId}
            onSubmit={(event) => {
              event.preventDefault()
              event.stopPropagation()
              form.handleSubmit()
            }}
            className="space-y-6"
          >
            {/* BAC Resolution Main Information */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-5 shadow-xs">
              <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
                BAC Resolution Details
              </h4>

              {/* Title & ABC */}
              <div className="grid gap-5 md:grid-cols-3">
                <div className="md:col-span-2">
                  <form.Field name="title">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Title *</Label>
                        <Input
                          id={field.name}
                          value={field.state.value}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isLoading || isSubmitting}
                          placeholder="Resolution Title..."
                        />
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>

                <div>
                  <form.Field name="abc">
                    {(field) => (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>Approved Budget (ABC) *</Label>
                        <Input
                          id={field.name}
                          type="number"
                          step="0.01"
                          value={field.state.value}
                          disabled={true}
                          className="bg-default-100 font-semibold cursor-not-allowed text-default-700"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Read-only budget inherited directly from source record.
                        </p>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
              </div>

              {/* Resolution Number, Type, Date Resolved, & Resolved Location */}
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
                <form.Field name="resolutionNumber">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolution Number *</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="BAC-RES-2026-001"
                        disabled={isLoading || isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="resolutionType">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolution Type *</Label>
                      <select
                        id={field.name}
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isSubmitting}
                        className="h-10 rounded-md border border-default-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                      >
                        <option value="award-recommendation">
                          Award Recommendation
                        </option>
                        <option value="procurement-mode-recommendation">
                          Procurement Mode Recommendation
                        </option>
                      </select>
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="dateResolved">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Date Resolved *</Label>
                      <Input
                        id={field.name}
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading || isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="resolvedLocation">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolved Location</Label>
                      <Input
                        id={field.name}
                        value={field.state.value || ''}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. BAC Conference Room, Main Bldg"
                        disabled={isLoading || isSubmitting}
                      />
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* Representatives Section */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4 shadow-xs">
              <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
                Resolution Representatives
              </h4>
              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="endUserRepresentativeId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>End-User Representative</Label>
                      {isUsersLoading ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Loading users...
                        </div>
                      ) : (
                        <UserPickerCombobox
                          value={field.state.value}
                          onChange={(userId) => field.handleChange(userId)}
                          users={users}
                          disabled={isSubmitting}
                          placeholder="Select End-User Representative..."
                        />
                      )}
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>

                <form.Field name="techRepresentativeId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Technical Representative</Label>
                      {isUsersLoading ? (
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                          Loading users...
                        </div>
                      ) : (
                        <UserPickerCombobox
                          value={field.state.value}
                          onChange={(userId) => field.handleChange(userId)}
                          users={users}
                          disabled={isSubmitting}
                          placeholder="Select Technical Representative..."
                        />
                      )}
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* WHEREAS Clauses Preview & Selection Panel */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-default-900 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    WHEREAS Clauses
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Legal clause sequence for this resolution document.
                  </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsCreateWhereasModalOpen(true)}
                    className="gap-1.5 text-xs text-default-700 border-default-300 hover:bg-default-100"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Create Custom Template
                  </Button>
                  <Button
                    type="button"
                    variant="default"
                    size="sm"
                    onClick={() => setIsWhereasPickerOpen(true)}
                    className="gap-1.5 text-xs font-semibold"
                  >
                    <FileText className="h-3.5 w-3.5" />
                    Select WHEREAS Clauses
                  </Button>
                </div>
              </div>

              <form.Field name="whereasClauses">
                {(field) => {
                  const currentItems: WhereasClauses[] = field.state.value || []

                  const removeItem = (templateId: string) => {
                    const nextItems = currentItems
                      .filter((c) => c.whereasClauseId !== templateId)
                      .map((c, idx) => ({
                        whereasClauseId: c.whereasClauseId,
                        order: idx,
                      }))
                    field.handleChange(nextItems)
                  }

                  const moveUp = (index: number) => {
                    if (index <= 0) return
                    const newArr = [...currentItems]
                    const temp = newArr[index - 1]
                    newArr[index - 1] = newArr[index]
                    newArr[index] = temp
                    const reindexed = newArr.map((item, idx) => ({
                      ...item,
                      order: idx,
                    }))
                    field.handleChange(reindexed)
                  }

                  const moveDown = (index: number) => {
                    if (index >= currentItems.length - 1) return
                    const newArr = [...currentItems]
                    const temp = newArr[index + 1]
                    newArr[index + 1] = newArr[index]
                    newArr[index] = temp
                    const reindexed = newArr.map((item, idx) => ({
                      ...item,
                      order: idx,
                    }))
                    field.handleChange(reindexed)
                  }

                  const handleDragStart = (e: React.DragEvent, index: number) => {
                    e.dataTransfer.setData('text/plain', index.toString())
                    setDraggedIndex(index)
                  }

                  const handleDragOver = (e: React.DragEvent) => {
                    e.preventDefault()
                  }

                  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
                    e.preventDefault()
                    const sourceIndexStr = e.dataTransfer.getData('text/plain')
                    const sourceIndex = sourceIndexStr ? parseInt(sourceIndexStr, 10) : draggedIndex
                    if (sourceIndex === null || sourceIndex === undefined || isNaN(sourceIndex) || sourceIndex === targetIndex) {
                      setDraggedIndex(null)
                      return
                    }

                    const updated = [...currentItems]
                    const [removed] = updated.splice(sourceIndex, 1)
                    updated.splice(targetIndex, 0, removed)
                    const reindexed = updated.map((item, idx) => ({ ...item, order: idx }))
                    field.handleChange(reindexed)
                    setDraggedIndex(null)
                  }

                  return (
                    <div className="space-y-3">
                      {currentItems.length === 0 ? (
                        <div
                          onClick={() => setIsWhereasPickerOpen(true)}
                          className="flex flex-col items-center justify-center p-8 text-center cursor-pointer rounded-lg border-2 border-dashed border-default-200 bg-default-50/50 hover:border-primary/50 hover:bg-primary/5 transition-all group"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-default-200 text-default-400 group-hover:text-primary group-hover:border-primary/30 mb-2 shadow-2xs transition-colors">
                            <Plus className="h-5 w-5" />
                          </div>
                          <p className="font-semibold text-xs text-default-800 group-hover:text-primary transition-colors">
                            No WHEREAS clauses added yet
                          </p>
                          <p className="text-[11.5px] text-muted-foreground mt-0.5 max-w-sm">
                            Click here to open the selection modal and add legal clause templates to this resolution.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <Badge color="default" variant="soft" className="px-2.5 py-0.5 text-xs font-bold gap-1">
                              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                              {currentItems.length} Clause{currentItems.length > 1 ? 's' : ''} in Resolution Sequence
                            </Badge>
                            <span className="text-[11px] text-muted-foreground">
                              Drag rows or use arrows to adjust position
                            </span>
                          </div>

                          <div className="space-y-2">
                            {currentItems.map((item, index: number) => {
                              const template = whereasTemplates.find((t) => t.id === item.whereasClauseId)
                              if (!template) return null
                              const isBeingDragged = draggedIndex === index

                              return (
                                <div
                                  key={item.whereasClauseId}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, index)}
                                  onDragOver={handleDragOver}
                                  onDrop={(e) => handleDrop(e, index)}
                                  onDragEnd={() => setDraggedIndex(null)}
                                  className={cn(
                                    'flex items-center gap-3 rounded-lg border border-default-200 bg-white p-2.5 text-xs transition-all hover:border-primary/40 hover:shadow-xs group',
                                    isBeingDragged && 'opacity-40 border-primary border-dashed bg-primary/5',
                                  )}
                                >
                                  <div className="cursor-grab active:cursor-grabbing text-default-400 hover:text-primary p-0.5">
                                    <GripVertical className="h-4 w-4" />
                                  </div>
                                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-[11px] shadow-2xs">
                                    {index + 1}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="font-semibold text-default-900 truncate">
                                      {template.name}
                                    </div>
                                    <div className="text-[11px] text-muted-foreground truncate font-serif">
                                      {template.body}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1 shrink-0">
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      disabled={index === 0 || isLoading || isSubmitting}
                                      onClick={() => moveUp(index)}
                                      className="h-7 w-7 border-default-200 bg-white text-default-700 hover:bg-primary/5 hover:text-primary disabled:opacity-25"
                                      title="Move Up"
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      disabled={index === currentItems.length - 1 || isLoading || isSubmitting}
                                      onClick={() => moveDown(index)}
                                      className="h-7 w-7 border-default-200 bg-white text-default-700 hover:bg-primary/5 hover:text-primary disabled:opacity-25"
                                      title="Move Down"
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      disabled={isLoading || isSubmitting}
                                      onClick={() => removeItem(item.whereasClauseId)}
                                      className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                      title="Remove from sequence"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}

                      <FieldInfo field={field} />

                      <WhereasClausePickerModal
                        open={isWhereasPickerOpen}
                        onOpenChange={setIsWhereasPickerOpen}
                        templates={whereasTemplates}
                        initialSelected={currentItems}
                        onApply={(updatedItems) => field.handleChange(updatedItems)}
                        onCreateCustom={() => setIsCreateWhereasModalOpen(true)}
                        isPending={isWhereasPending}
                      />
                    </div>
                  )
                }}
              </form.Field>
            </div>

            {submitError && (
              <p className="text-sm text-destructive font-medium">
                {submitError}
              </p>
            )}
          </form>
        )}

        <CreateEditWhereasClauseDialog
          open={isCreateWhereasModalOpen}
          onOpenChange={setIsCreateWhereasModalOpen}
          onSave={handleCreateCustomWhereas}
          isSubmitting={createWhereasMutation.isPending}
        />
      </div>
    )
  },
)

CreateBacResolutionForm.displayName = 'CreateBacResolutionForm'

interface SourceTypeSelectorStepProps {
  selectedSourceType: ProcurementSourceType | null
  onSelectSourceType: (type: ProcurementSourceType) => void
}

export function SourceTypeSelectorStep({
  selectedSourceType,
  onSelectSourceType,
}: SourceTypeSelectorStepProps) {
  return (
    <div className="space-y-6 py-2">
      <div>
        <h3 className="text-lg font-semibold text-default-900">
          Select Procurement Source
        </h3>
        <p className="text-sm text-muted-foreground">
          Choose the authoritative source from which this BAC Resolution originates. A Procurement Project context will be automatically created.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Path A: From APP Item */}
        <div
          onClick={() => onSelectSourceType('AppItem')}
          className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary hover:shadow-md ${selectedSourceType === 'AppItem'
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-default-200 bg-white'
            }`}
        >
          {selectedSourceType === 'AppItem' && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-blue-100 px-2.5 py-0.5 font-semibold text-blue-800 text-xs">
                  Path A — APP Driven
                </span>
              </div>
              <h4 className="mt-2 font-bold text-base text-default-900">
                From APP Item
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Create a BAC Resolution directly from an approved Annual Procurement Plan (APP) item without passing through PR Consolidation.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-default-100 p-2.5 text-xs text-default-600">
            <span className="font-semibold text-default-700">Workflow:</span> APP → APP Item → ProcurementProject → BAC Resolution → PR → Procurement Execution
          </div>
        </div>

        {/* Path B: From Consolidated PR */}
        <div
          onClick={() => onSelectSourceType('ConsolidatedPr')}
          className={`relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary hover:shadow-md ${selectedSourceType === 'ConsolidatedPr'
            ? 'border-primary bg-primary/5 shadow-sm'
            : 'border-default-200 bg-white'
            }`}
        >
          {selectedSourceType === 'ConsolidatedPr' && (
            <div className="absolute top-4 right-4 text-primary">
              <CheckCircle2 className="h-6 w-6 fill-primary text-white" />
            </div>
          )}

          <div className="space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 font-semibold text-emerald-800 text-xs">
                  Path B — Consolidated PR Driven
                </span>
              </div>
              <h4 className="mt-2 font-bold text-base text-default-900">
                From Consolidated PR
              </h4>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Create a BAC Resolution from an approved Consolidated Purchase Request (CPR) containing multiple combined PR items.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-default-100 p-2.5 text-xs text-default-600">
            <span className="font-semibold text-default-700">Workflow:</span> APP → APP Item → PR → Consolidated PR → ProcurementProject → BAC Resolution → Procurement Execution
          </div>
        </div>
      </div>
    </div>
  )
}

interface SourceRecordPickerStepProps {
  sourceType: ProcurementSourceType
  selectedAppItem: EligibleAppItem | null
  selectedConsolidatedPr: EligibleConsolidatedPR | null
  onSelectAppItem: (
    app: EligibleAppForProcurement,
    item: EligibleAppItem,
  ) => void
  onSelectConsolidatedPr: (cpr: EligibleConsolidatedPR) => void
}

export function SourceRecordPickerStep({
  sourceType,
  selectedAppItem,
  selectedConsolidatedPr,
  onSelectAppItem,
  onSelectConsolidatedPr,
}: SourceRecordPickerStepProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [officeFilter, setOfficeFilter] = useState('ALL')
  const [selectedAppRecord, setSelectedAppRecord] =
    useState<EligibleAppForProcurement | null>(null)

  const { data: appsData, isLoading: isAppsLoading } =
    useEligibleAppsForProcurement({})
  const { data: cprsData, isLoading: isCprsLoading } =
    useEligibleConsolidatedPRs({})

  // If there's an already selected app item, ensure its parent APP is active
  useEffect(() => {
    if (
      selectedAppItem &&
      !selectedAppRecord &&
      (appsData?.data || []).length > 0
    ) {
      const parent = (appsData?.data || []).find((a) =>
        a.eligibleItems.some((i) => i.id === selectedAppItem.id),
      )
      if (parent) {
        setSelectedAppRecord(parent)
      }
    }
  }, [selectedAppItem, selectedAppRecord, appsData?.data])

  const filteredAppRecords = useMemo(() => {
    return (appsData?.data || []).filter((app) => {
      const matchesSearch =
        app.appNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.fiscalYearName.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesSearch
    })
  }, [appsData?.data, searchTerm])

  const currentAppItems = useMemo(() => {
    if (!selectedAppRecord) return []
    return selectedAppRecord.eligibleItems
  }, [selectedAppRecord])

  const filteredChildAppItems = useMemo(() => {
    return currentAppItems.filter((item) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.officeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.procurementModeName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesOffice =
        officeFilter === 'ALL' || item.officeName === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [currentAppItems, searchTerm, officeFilter])

  const filteredConsolidatedPrs = useMemo(() => {
    return (cprsData?.data || []).filter((cpr) => {
      const matchesSearch =
        cpr.prNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.endUser.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cpr.modeOfProcurementName
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      const matchesOffice =
        officeFilter === 'ALL' || cpr.endUser === officeFilter
      return matchesSearch && matchesOffice
    })
  }, [cprsData?.data, searchTerm, officeFilter])

  const availableOffices = useMemo(() => {
    if (sourceType === 'AppItem') {
      if (selectedAppRecord) {
        return Array.from(
          new Set(currentAppItems.map((i) => i.officeName).filter(Boolean)),
        )
      }
      return []
    }
    return Array.from(
      new Set((cprsData?.data || []).map((c) => c.endUser).filter(Boolean)),
    )
  }, [sourceType, selectedAppRecord, currentAppItems, cprsData?.data])

  return (
    <div className="space-y-4 py-2">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-default-900">
            {sourceType === 'AppItem'
              ? selectedAppRecord
                ? `Select APP Item from ${selectedAppRecord.appNumber}`
                : 'Step 2.1: Select Annual Procurement Plan (APP)'
              : 'Select Approved Consolidated PR'}
          </h3>
          <p className="text-xs text-muted-foreground">
            {sourceType === 'AppItem'
              ? selectedAppRecord
                ? 'Choose the specific procurement item to generate this BAC Resolution for.'
                : 'Select an approved parent Annual Procurement Plan to browse its line items.'
              : 'Only approved Consolidated PRs available for BAC resolution are listed.'}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={
              sourceType === 'AppItem'
                ? selectedAppRecord
                  ? `Search items in ${selectedAppRecord.appNumber} by description, mode, or office...`
                  : 'Search Annual Procurement Plans by APP #, title, fiscal year...'
                : 'Search by CPR #, project description, end-user office...'
            }
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm"
          />
        </div>

        {availableOffices.length > 0 && (
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={officeFilter}
              onChange={(e) => setOfficeFilter(e.target.value)}
              className="h-9 rounded-md border border-default-300 bg-white px-3 py-1 text-xs text-default-800 focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Offices / Implementing Units</option>
              {availableOffices.map((office) => (
                <option key={office} value={office}>
                  {office}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tables depending on Source Type */}
      {sourceType === 'AppItem' ? (
        isAppsLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
            Loading eligible Annual Procurement Plans...
          </div>
        ) : !selectedAppRecord ? (
          /* Stage 1: Select Parent APP */
          <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {filteredAppRecords.map((app) => {
                const count = app.eligibleItems.length
                const totalBudget = app.eligibleItems.reduce(
                  (sum, item) => sum + item.effectiveABC,
                  0,
                )
                return (
                  <div
                    key={app.id}
                    onClick={() => {
                      setSelectedAppRecord(app)
                      setSearchTerm('')
                    }}
                    className="group relative cursor-pointer rounded-xl border border-default-200 bg-white p-4 shadow-xs transition-all hover:border-primary/50 hover:shadow-md hover:bg-primary/5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                          <FileSpreadsheet className="h-4 w-4" />
                        </div>
                        <div>
                          <span className="font-bold text-sm text-foreground">
                            {app.appNumber}
                          </span>
                          <span className="ml-2 inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
                            {app.fiscalYearName || 'FY 2026'}
                          </span>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                    </div>

                    <p className="mt-2.5 text-xs text-default-700 font-medium line-clamp-2 leading-relaxed">
                      {app.name}
                    </p>

                    <div className="mt-3.5 pt-3 border-t border-default-100 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-default-600">
                        <PackageCheck className="h-3.5 w-3.5 text-primary" />
                        {count} eligible item(s)
                      </span>
                      <span className="font-bold text-emerald-700">
                        ₱
                        {totalBudget.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            {filteredAppRecords.length === 0 && (
              <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-8 text-center text-sm text-muted-foreground">
                No eligible Annual Procurement Plans match your search criteria.
              </div>
            )}
          </div>
        ) : (
          /* Stage 2: Select Child APP Item */
          <div className="space-y-3">
            {/* Selected APP Context Header */}
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-4 w-4 text-primary" />
                <span className="font-bold text-default-900">
                  {selectedAppRecord.appNumber}
                </span>
                <span className="text-muted-foreground">|</span>
                <span className="text-default-700 font-medium truncate max-w-[400px]">
                  {selectedAppRecord.name}
                </span>
              </div>
              <Badge
                variant="outline"
                className="bg-white text-primary border-primary/30"
              >
                {currentAppItems.length} Available Line Items
              </Badge>
            </div>

            <div className="overflow-hidden rounded-lg border border-default-200 bg-white max-h-[360px] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-default-50 shadow-xs z-10">
                  <TableRow>
                    <TableHead className="w-12 text-center">Select</TableHead>
                    <TableHead className="w-[100px]">Item #</TableHead>
                    <TableHead>Project / Item Description</TableHead>
                    <TableHead>Office / Unit</TableHead>
                    <TableHead>Procurement Mode</TableHead>
                    <TableHead>Source of Fund</TableHead>
                    <TableHead className="text-right">Budget (ABC)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChildAppItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={7}
                        className="text-center py-8 text-sm text-muted-foreground"
                      >
                        No items found in this APP matching your search.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredChildAppItems.map((item) => {
                      const isSelected = selectedAppItem?.id === item.id
                      return (
                        <TableRow
                          key={item.id}
                          onClick={() =>
                            onSelectAppItem(selectedAppRecord, item)
                          }
                          className={`cursor-pointer transition-colors ${isSelected
                            ? 'bg-primary/10 hover:bg-primary/15'
                            : 'hover:bg-default-50'
                            }`}
                        >
                          <TableCell className="text-center">
                            <div
                              className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full border ${isSelected
                                ? 'border-primary bg-primary text-white'
                                : 'border-default-300 bg-white'
                                }`}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 stroke-[3]" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-xs text-primary">
                            {item.itemNumber}
                          </TableCell>
                          <TableCell className="font-medium text-xs text-default-900 max-w-[260px] truncate">
                            {item.ppmpItemName || item.description}
                          </TableCell>
                          <TableCell className="text-xs text-default-700">
                            <div className="flex items-center gap-1.5">
                              <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                              <span>{item.officeName || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-xs">
                            <Badge
                              variant="outline"
                              className="font-normal text-[11px] bg-blue-50 text-blue-700 border-blue-200"
                            >
                              {item.procurementModeName || 'Public Bidding'}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-default-600">
                            <div className="flex items-center gap-1">
                              <Wallet className="h-3.5 w-3.5 text-muted-foreground" />
                              <span className="truncate max-w-[140px]">
                                {item.fundSourceName || 'GAA'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold text-xs text-emerald-700">
                            ₱
                            {item.effectiveABC.toLocaleString('en-US', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        )
      ) : isCprsLoading ? (
        <div className="flex flex-col items-center justify-center p-12 text-sm text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
          Loading eligible Consolidated Purchase Requests...
        </div>
      ) : (
        /* Consolidated PR Table */
        <div className="overflow-hidden rounded-lg border border-default-200 bg-white max-h-[380px] overflow-y-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-default-50 shadow-xs z-10">
              <TableRow>
                <TableHead className="w-12 text-center">Select</TableHead>
                <TableHead className="w-[140px]">Consolidated PR #</TableHead>
                <TableHead>Project Title / Purpose</TableHead>
                <TableHead>Implementing Unit / End-User</TableHead>
                <TableHead>Procurement Mode</TableHead>
                <TableHead className="text-right">Total ABC</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConsolidatedPrs.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-sm text-muted-foreground"
                  >
                    No approved Consolidated PRs match your search criteria.
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsolidatedPrs.map((cpr) => {
                  const isSelected = selectedConsolidatedPr?.id === cpr.id
                  return (
                    <TableRow
                      key={cpr.id}
                      onClick={() => onSelectConsolidatedPr(cpr)}
                      className={`cursor-pointer transition-colors ${isSelected
                        ? 'bg-primary/10 hover:bg-primary/15'
                        : 'hover:bg-default-50'
                        }`}
                    >
                      <TableCell className="text-center">
                        <div
                          className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full border ${isSelected
                            ? 'border-primary bg-primary text-white'
                            : 'border-default-300 bg-white'
                            }`}
                        >
                          {isSelected && (
                            <Check className="h-3 w-3 stroke-[3]" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-xs text-emerald-800">
                        {cpr.prNumber}
                        <div className="mt-0.5">
                          <Badge
                            variant="secondary"
                            className="text-[10px] px-1.5 py-0 bg-emerald-100 text-emerald-800"
                          >
                            Combined Items
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-xs text-default-900 max-w-[260px] truncate">
                        {cpr.projectName || cpr.description}
                      </TableCell>
                      <TableCell className="text-xs text-default-700">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{cpr.endUser}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <Badge
                          variant="outline"
                          className="font-normal text-[11px] bg-purple-50 text-purple-700 border-purple-200"
                        >
                          {cpr.modeOfProcurementName}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-xs text-emerald-700">
                        ₱
                        {cpr.totalAmount.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}

export function UserPickerCombobox({
  value,
  onChange,
  users,
  disabled = false,
  placeholder = 'Select representative...',
}: {
  value?: string
  onChange: (userId: string) => void
  users: User[]
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const selectedUser = useMemo(
    () => users.find((u) => u.id === value),
    [users, value],
  )

  const getDisplayName = (user: User) => {
    if (
      user.fullName &&
      user.fullName.trim() &&
      user.fullName.toLowerCase() !== 'n/a'
    ) {
      return user.fullName
    }
    const parts = [user.firstName, user.lastName].filter(Boolean)
    if (parts.length > 0) return parts.join(' ')
    return user.username || user.email || 'Unnamed User'
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users
    const q = searchQuery.toLowerCase().trim()
    return users.filter((u) => {
      const name = getDisplayName(u).toLowerCase()
      const emp = (u.employeeNumber || '').toLowerCase()
      const office = (u.officeName || '').toLowerCase()
      return name.includes(q) || emp.includes(q) || office.includes(q)
    })
  }, [users, searchQuery])

  const handleSelectUser = (userId: string) => {
    onChange(userId)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal text-left bg-white border-default-200 text-default-900 hover:bg-default-50 h-10"
        >
          {selectedUser ? (
            <span className="truncate font-medium">
              {getDisplayName(selectedUser)}
              {selectedUser.employeeNumber
                ? ` (${selectedUser.employeeNumber})`
                : ''}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <div className="p-2 border-b border-default-100 bg-default-50/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search user by name or employee #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-white"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-[260px] overflow-y-auto p-1 space-y-0.5">
          {filteredUsers.length === 0 ? (
            <div className="py-6 text-center text-xs text-muted-foreground">
              No user found.
            </div>
          ) : (
            filteredUsers.map((user) => {
              const displayName = getDisplayName(user)
              const isSelected = value === user.id
              return (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectUser(user.id)}
                  className={cn(
                    'w-full text-left flex items-center justify-between py-2 px-2.5 rounded-md text-xs transition-colors cursor-pointer',
                    isSelected
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'hover:bg-default-100 text-default-900',
                  )}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Check
                      className={cn(
                        'h-3.5 w-3.5 shrink-0',
                        isSelected ? 'opacity-100 text-primary' : 'opacity-0',
                      )}
                    />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-xs text-default-900 truncate">
                        {displayName}
                      </span>
                      {user.officeName && (
                        <span className="text-[11px] text-muted-foreground truncate">
                          {user.officeName}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}




