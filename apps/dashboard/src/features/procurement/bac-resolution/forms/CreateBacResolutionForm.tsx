import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Check,
  Loader2,
  FileText,
  Layers,
  CheckCircle2,
  Search,
  Filter,
  Building2,
  Wallet,
  ArrowLeft,
  ChevronRight,
  FileSpreadsheet,
  PackageCheck,
  Plus,
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
  ProcurementProjectContext,
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
import { ProcurementProjectPreviewBanner } from '../components/ProcurementProjectPreviewBanner'
import type { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'
import { CreateEditWhereasClauseDialog } from '../dialogs/CreateEditWhereasClauseDialog'

export const createBacResolutionSchema = z.object({
  appItemId: z.string().optional(),
  consolidatedPRId: z.string().optional(),
  title: z.string().min(1, 'Title is required.'),
  abc: z.number().min(0, 'ABC must be at least 0.'),
  resolutionType: z.string().min(1, 'Resolution type is required.'),
  resolutionNumber: z.string().min(1, 'Resolution number is required.'),
  dateResolved: z.string().min(1, 'Date resolved is required.'),
  whereasClauseIds: z
    .array(z.string())
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

function getUserDisplayName(user: User): string {
  if (
    user.fullName &&
    typeof user.fullName === 'string' &&
    user.fullName.trim() &&
    user.fullName.toLowerCase() !== 'n/a'
  ) {
    return user.fullName
  }
  const parts = [user.firstName, user.lastName].filter(Boolean)
  if (parts.length > 0) return parts.join(' ')
  return user.username || user.email || 'Unnamed User'
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
    const [selectedAppParent, setSelectedAppParent] =
      useState<EligibleAppForProcurement | null>(null)
    const [selectedConsolidatedPr, setSelectedConsolidatedPr] =
      useState<EligibleConsolidatedPR | null>(null)

    const { data: bacResolutionWhereasClauses, isPending: isWhereasPending } =
      useWhereasClauseTemplates({
        pathParams: {},
        queryParams: {},
      })

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

    const projectContext = useMemo<ProcurementProjectContext | null>(() => {
      if (
        selectedSourceType === 'AppItem' &&
        selectedAppItem &&
        selectedAppParent
      ) {
        return {
          sourceType: 'AppItem',
          sourceRef: `${selectedAppParent.appNumber} / ${selectedAppItem.itemNumber}`,
          projectTitle: selectedAppItem.description,
          officeName: selectedAppItem.officeName,
          modeOfProcurement: selectedAppItem.procurementModeName,
          procurementModeId: selectedAppItem.procurementModeId,
          sourceOfFund: selectedAppItem.fundSourceName,
          abc: selectedAppItem.effectiveABC,
        }
      }

      if (selectedSourceType === 'ConsolidatedPr' && selectedConsolidatedPr) {
        return {
          sourceType: 'ConsolidatedPr',
          sourceRef: selectedConsolidatedPr.prNumber,
          projectTitle:
            selectedConsolidatedPr.projectName ||
            selectedConsolidatedPr.description,
          officeName: selectedConsolidatedPr.endUser,
          modeOfProcurement: selectedConsolidatedPr.modeOfProcurementName,
          procurementModeId: selectedConsolidatedPr.procurementModeId,
          sourceOfFund: 'General Appropriations Act (GAA)',
          abc: selectedConsolidatedPr.totalAmount,
        }
      }

      return null
    }, [
      selectedSourceType,
      selectedAppItem,
      selectedAppParent,
      selectedConsolidatedPr,
    ])

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
      const currentSelected = form.getFieldValue('whereasClauseIds') || []
      form.setFieldValue('whereasClauseIds', [...currentSelected, created.id])
      toast.success('Custom WHEREAS Clause created and added to resolution.')
    }

    const defaultResNumber = `BAC-RES-2026-${Math.floor(
      100 + Math.random() * 900,
    )}`

    const initialFormValues: CreateBacResolutionFormValues = {
      appItemId: initialValues?.appItemId || undefined,
      consolidatedPRId: initialValues?.consolidatedPRId || undefined,
      title: initialValues?.title ?? projectContext?.projectTitle ?? '',
      abc: initialValues?.abc ?? projectContext?.abc ?? 0,
      resolutionType: initialValues?.resolutionType ?? 'award-recommendation',
      resolutionNumber:
        initialValues?.resolutionNumber ??
        defaultResNumber,
      dateResolved:
        initialValues?.dateResolved ??
        new Date().toISOString().split('T')[0],
      whereasClauseIds: initialValues?.whereasClauseIds || [],
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
          const payload: CreateBacResolutionPayload = {
            sourceType: selectedSourceType || (value.appItemId ? 'AppItem' : 'ConsolidatedPr'),
            appItemId: value.appItemId || undefined,
            consolidatedPRId: value.consolidatedPRId || undefined,
            title: value.title,
            abc: value.abc,
            resolutionType: value.resolutionType,
            // bacResolutionNumber: value.resolutionNumber,
            resolutionNumber: value.resolutionNumber,
            // resolutionDate: value.dateResolved,
            dateResolved: value.dateResolved,
            // description: value.title,
            // resolvedDateText: value.dateResolved,
            // resolvedLocationText: '',
            whereasClauseIds: value.whereasClauseIds,
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

    // Sync title & ABC when projectContext changes
    useEffect(() => {
      if (projectContext) {
        form.setFieldValue('title', projectContext.projectTitle)
        form.setFieldValue('abc', projectContext.abc)
      }
    }, [projectContext, form])

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
              setSelectedAppParent(null)
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
              setSelectedAppParent(parent)
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
            {/* Read-Only Procurement Project Preview Banner */}
            {projectContext && (
              <ProcurementProjectPreviewBanner context={projectContext} />
            )}

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
                          onBlur={field.handleBlur}
                          onChange={(e) =>
                            field.handleChange(parseFloat(e.target.value) || 0)
                          }
                          disabled={isLoading || isSubmitting}
                        />
                        <p className="text-[11px] text-muted-foreground">
                          Derived from source record. Adjust if formally revised.
                        </p>
                        <FieldInfo field={field} />
                      </div>
                    )}
                  </form.Field>
                </div>
              </div>

              {/* Resolution Number, Type, & Date Resolved */}
              <div className="grid gap-5 md:grid-cols-3">
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
                        <select
                          id={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isSubmitting}
                          className="h-10 w-full rounded-md border border-default-300 bg-white px-3 py-2 text-sm text-default-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="">Select End-User Representative...</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {getUserDisplayName(user)}
                              {user.employeeNumber ? ` (${user.employeeNumber})` : ''}
                              {user.officeName ? ` - ${user.officeName}` : ''}
                            </option>
                          ))}
                        </select>
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
                        <select
                          id={field.name}
                          value={field.state.value || ''}
                          onBlur={field.handleBlur}
                          onChange={(e) => field.handleChange(e.target.value)}
                          disabled={isSubmitting}
                          className="h-10 w-full rounded-md border border-default-300 bg-white px-3 py-2 text-sm text-default-900 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
                        >
                          <option value="">Select Technical Representative...</option>
                          {users.map((user) => (
                            <option key={user.id} value={user.id}>
                              {getUserDisplayName(user)}
                              {user.employeeNumber ? ` (${user.employeeNumber})` : ''}
                              {user.officeName ? ` - ${user.officeName}` : ''}
                            </option>
                          ))}
                        </select>
                      )}
                      <FieldInfo field={field} />
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* WHEREAS Clauses Section */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default-200 pb-2">
                <div>
                  <h4 className="font-bold text-sm text-default-900">
                    WHEREAS Clause Templates
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Select the clause templates to include in this resolution.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCreateWhereasModalOpen(true)}
                  className="gap-1.5 text-xs text-primary border-primary/30 hover:bg-primary/5 self-start sm:self-auto"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Create Custom WHEREAS Template
                </Button>
              </div>

              <form.Field name="whereasClauseIds">
                {(field) => {
                  const selectedIds = field.state.value || []

                  const toggleTemplate = (templateId: string) => {
                    if (selectedIds.includes(templateId)) {
                      field.handleChange(
                        selectedIds.filter((id: string) => id !== templateId),
                      )
                    } else {
                      field.handleChange([...selectedIds, templateId])
                    }
                  }

                  return (
                    <div className="space-y-3">
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {isWhereasPending ? (
                          <div className="flex flex-col items-center justify-center p-8 text-xs text-muted-foreground">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mb-2" />
                            Loading WHEREAS clause templates...
                          </div>
                        ) : whereasTemplates.length === 0 ? (
                          <div className="rounded-lg border border-dashed border-default-200 bg-default-50 p-6 text-center text-xs text-muted-foreground">
                            No WHEREAS clause templates found in the repository. Create clause templates in the WHEREAS Clause Repository page to select them here.
                          </div>
                        ) : (
                          whereasTemplates.map((template) => {
                            const isChecked = selectedIds.includes(template.id)
                            return (
                              <label
                                key={template.id}
                                className={cn(
                                  'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors',
                                  isChecked
                                    ? 'border-primary bg-primary/5'
                                    : 'border-default-200 bg-white hover:border-default-300',
                                )}
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={() =>
                                    toggleTemplate(template.id)
                                  }
                                  disabled={isLoading || isSubmitting}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 space-y-1 text-xs">
                                  <span className="font-semibold text-default-900">
                                    {template.name}
                                  </span>
                                  <p className="text-muted-foreground leading-relaxed font-serif">
                                    {template.body}
                                  </p>
                                </div>
                              </label>
                            )
                          })
                        )}
                      </div>
                      <FieldInfo field={field} />
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

        {sourceType === 'AppItem' && selectedAppRecord && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedAppRecord(null)
              setSearchTerm('')
            }}
            className="gap-1.5 self-start sm:self-auto text-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Switch Parent APP
          </Button>
        )}
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
                            {item.description}
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




