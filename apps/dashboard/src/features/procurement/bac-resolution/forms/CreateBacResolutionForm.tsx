import { useEffect, useMemo, useState, forwardRef, useImperativeHandle, useRef } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Check, ChevronsUpDown, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type {
  EligibleAppForProcurement,
  EligibleAppItem,
  EligibleConsolidatedPR,
  ProcurementProjectContext,
  ProcurementSourceType,
} from '../types'
import FieldInfo from '@/components/FieldInfo'
import { fetchUsers, type User } from '@/services/api/users'
import { SourceTypeSelectorStep } from './steps/SourceTypeSelectorStep'
import { SourceRecordPickerStep } from './steps/SourceRecordPickerStep'
import { ProcurementProjectPreviewBanner } from '../components/ProcurementProjectPreviewBanner'
import type { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'

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

export const MOCK_WHEREAS_CLAUSE_TEMPLATES = [
  {
    id: 'whereas-1',
    name: 'Standard Procurement Requirement Clause',
    body: 'WHEREAS, the End-User Office submitted a Purchase Request for the procurement of goods/services essential for official operations;',
  },
  {
    id: 'whereas-2',
    name: 'Annual Procurement Plan (APP) Inclusion Clause',
    body: 'WHEREAS, the proposed procurement project is included in the approved Annual Procurement Plan (APP) of the agency;',
  },
  {
    id: 'whereas-3',
    name: 'Certificate of Availability of Funds (CAF) Clause',
    body: 'WHEREAS, funds for the procurement project are available and duly certified by the Budget Office;',
  },
  {
    id: 'whereas-4',
    name: 'Alternative Mode of Procurement Recommendation Clause',
    body: 'WHEREAS, based on the conditions and threshold under Republic Act No. 9184 and its Revised IRR, the BAC recommends the use of Negotiated Procurement / Small Value Procurement;',
  },
]

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

function UserPickerCombobox({
  value,
  onChange,
  users,
  disabled,
  placeholder = 'Select representative...',
}: {
  value?: string
  onChange: (userId: string) => void
  users: User[]
  disabled?: boolean
  placeholder?: string
}) {
  const [open, setOpen] = useState(false)

  const selectedUser = useMemo(
    () => users.find((u) => u.id === value),
    [users, value],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className="w-full justify-between font-normal text-left"
        >
          {selectedUser
            ? `${selectedUser.fullName}${selectedUser.employeeNumber
              ? ` (${selectedUser.employeeNumber})`
              : ''
            }`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[350px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search user by name or employee #..." />
          <CommandList>
            <CommandEmpty>No user found.</CommandEmpty>
            <CommandGroup>
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  value={`${user.fullName} ${user.employeeNumber || ''}`}
                  onSelect={() => {
                    onChange(user.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value === user.id ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{user.fullName}</span>
                    {user.officeName && (
                      <span className="text-xs text-muted-foreground">
                        {user.officeName}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
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

    // Authoritative Procurement Project Context
    const projectContext = useMemo<ProcurementProjectContext | null>(() => {
      if (
        selectedSourceType === 'APP_ITEM' &&
        selectedAppItem &&
        selectedAppParent
      ) {
        return {
          sourceType: 'APP_ITEM',
          sourceRef: `${selectedAppParent.appNumber} / ${selectedAppItem.itemNumber}`,
          projectTitle: selectedAppItem.description,
          officeName: selectedAppItem.officeName,
          modeOfProcurement: selectedAppItem.procurementModeName,
          procurementModeId: selectedAppItem.procurementModeId,
          sourceOfFund: selectedAppItem.fundSourceName,
          abc: selectedAppItem.effectiveABC,
        }
      }

      if (selectedSourceType === 'CONSOLIDATED_PR' && selectedConsolidatedPr) {
        return {
          sourceType: 'CONSOLIDATED_PR',
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

    // Users for representative comboboxes
    const [users, setUsers] = useState<User[]>([])
    const [isUsersLoading, setIsUsersLoading] = useState(false)

    useEffect(() => {
      setIsUsersLoading(true)
      fetchUsers()
        .then(setUsers)
        .catch((err) => console.error('Failed to load user suggestions:', err))
        .finally(() => setIsUsersLoading(false))
    }, [])

    const defaultResNumber = `BAC-RES-2026-${Math.floor(
      100 + Math.random() * 900,
    )}`

    // Initialize TanStack Form with Zod validation
    const form = useForm({
      defaultValues: {
        appItemId: initialValues?.appItemId ?? '',
        consolidatedPRId: initialValues?.consolidatedPRId ?? '',
        title: initialValues?.title ?? projectContext?.projectTitle ?? '',
        abc: initialValues?.abc ?? projectContext?.abc ?? 0,
        resolutionType: initialValues?.resolutionType ?? 'award-recommendation',
        resolutionNumber:
          initialValues?.resolutionNumber ??
          defaultResNumber,
        dateResolved:
          initialValues?.dateResolved ??
          new Date().toISOString().split('T')[0],
        whereasClauseIds:
          initialValues?.whereasClauseIds,
        endUserRepresentativeId: initialValues?.endUserRepresentativeId ?? '',
        techRepresentativeId: initialValues?.techRepresentativeId ?? '',
      },
      validators: {
        onChange: createBacResolutionSchema,
      },
      onSubmit: async ({ value }) => {
        setIsSubmitting(true)
        try {
          const payload: CreateBacResolutionPayload = {
            sourceType: selectedSourceType || undefined,
            appItemId: selectedAppItem?.id || value.appItemId || undefined,
            consolidatedPRId:
              selectedConsolidatedPr?.id || value.consolidatedPRId || undefined,
            title: value.title,
            abc: value.abc,
            resolutionType: value.resolutionType,
            bacResolutionNumber: value.resolutionNumber,
            resolutionNumber: value.resolutionNumber,
            resolutionDate: value.dateResolved,
            dateResolved: value.dateResolved,
            description: value.title,
            resolvedDateText: value.dateResolved,
            resolvedLocationText: '',
            whereasClauseIds: value.whereasClauseIds,
            whereasClauses: value.whereasClauseIds.map((id: string) => {
              const template = MOCK_WHEREAS_CLAUSE_TEMPLATES.find((t) => t.id === id)
              return {
                id,
                name: template?.name || 'WHEREAS Clause',
                body: template?.body || '',
              }
            }),
            provisionalMembers: [],
            endUserRepresentativeId: value.endUserRepresentativeId || undefined,
            techRepresentativeId: value.techRepresentativeId || undefined,
            procurementProjectContext: projectContext || undefined,
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
          (selectedSourceType === 'APP_ITEM' && selectedAppItem !== null) ||
          (selectedSourceType === 'CONSOLIDATED_PR' &&
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
          (selectedSourceType === 'APP_ITEM' && selectedAppItem !== null) ||
          (selectedSourceType === 'CONSOLIDATED_PR' &&
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
                      <Label>End-User Representative</Label>
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
                          disabled={isLoading || isSubmitting}
                          placeholder="Select End-User Representative..."
                        />
                      )}
                    </div>
                  )}
                </form.Field>

                <form.Field name="techRepresentativeId">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label>Technical Representative</Label>
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
                          disabled={isLoading || isSubmitting}
                          placeholder="Select Technical Representative..."
                        />
                      )}
                    </div>
                  )}
                </form.Field>
              </div>
            </div>

            {/* WHEREAS Clauses Section (Hardcoded Mock Templates at Bottom) */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4 shadow-xs">
              <div>
                <h4 className="font-bold text-sm text-default-900">
                  WHEREAS Clause Templates
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select the clause templates to include in this resolution.
                </p>
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
                        {MOCK_WHEREAS_CLAUSE_TEMPLATES.map((template) => {
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
                                <p className="text-muted-foreground leading-relaxed">
                                  {template.body}
                                </p>
                              </div>
                            </label>
                          )
                        })}
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
      </div>
    )
  },
)

CreateBacResolutionForm.displayName = 'CreateBacResolutionForm'


