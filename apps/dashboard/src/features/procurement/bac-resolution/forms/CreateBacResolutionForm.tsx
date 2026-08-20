import { useEffect, useMemo, useState } from 'react'
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
import type {
  EligibleAppForProcurement,
  EligibleAppItem,
  EligibleConsolidatedPR,
  ProcurementProjectContext,
  ProcurementSourceType,
} from '../types'
import { useWhereasClauseTemplates } from '../handlers/hooks'
import FieldInfo from '@/components/FieldInfo'
import { fetchUsers, type User } from '@/services/api/users'
import { SourceTypeSelectorStep } from './steps/SourceTypeSelectorStep'
import { SourceRecordPickerStep } from './steps/SourceRecordPickerStep'
import { ProcurementProjectPreviewBanner } from '../components/ProcurementProjectPreviewBanner'
import { CreateBacResolutionPayload } from '../handlers/createBacResolutionRequest'

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

interface CreateBacResolutionFormProps {
  onSubmit: (values: CreateBacResolutionPayload) => Promise<void> | void
  onCancel: () => void
  initialValues?: Partial<CreateBacResolutionPayload>
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
  currentStep: 1 | 2 | 3
  onStepChange: (step: 1 | 2 | 3) => void
  onCanProceedChange: (canProceed: boolean) => void
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
            ? `${selectedUser.fullName}${
                selectedUser.employeeNumber
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

export function CreateBacResolutionForm({
  onSubmit,
  initialValues,
  isLoading = false,
  onDirtyChange,
  formId,
  currentStep,
  onCanProceedChange,
}: CreateBacResolutionFormProps) {
  const [selectedSourceType, setSelectedSourceType] =
    useState<ProcurementSourceType | null>(
      initialValues?.sourceType === 'APP_ITEM'
        ? 'APP_ITEM'
        : initialValues?.sourceType === 'CONSOLIDATED_PR'
          ? 'CONSOLIDATED_PR'
          : null,
    )

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

  // Fetch WHEREAS templates
  const { data: apiTemplates, isLoading: isTemplatesLoading } = [] as any[]

  // Users for rep picker
  const [users, setUsers] = useState<User[]>([])
  const [isUsersLoading, setIsUsersLoading] = useState(false)

  useEffect(() => {
    setIsUsersLoading(true)
    fetchUsers()
      .then(setUsers)
      .catch((err) => console.error('Failed to load user suggestions:', err))
      .finally(() => setIsUsersLoading(false))
  }, [])

  const [submitError, setSubmitError] = useState<string | null>(null)

  const defaultResNumber = `BAC-RES-2026-${Math.floor(
    100 + Math.random() * 900,
  )}`

  const form = useForm({
    defaultValues: {
      title: initialValues?.title ?? projectContext?.projectTitle ?? '',
      abc: initialValues?.abc ?? projectContext?.abc ?? 0,
      resolutionType: initialValues?.resolutionType ?? 'award-recommendation',
      resolutionNumber: initialValues?.bacResolutionNumber ?? defaultResNumber,
      dateResolved:
        initialValues?.resolutionDate ??
        initialValues?.resolvedDateText ??
        new Date().toISOString().split('T')[0],
      whereasClauseIds:
        initialValues?.whereasClauses
          ?.map((c: { id?: string }) => c.id)
          .filter((id: string): id is string => !!id) ?? [],
      endUserRepresentativeId: initialValues?.endUserRepresentativeId ?? '',
      techRepresentativeId: initialValues?.techRepresentativeId ?? '',
    },
    onSubmit: async ({ value }) => {
      if (!selectedSourceType || !projectContext) {
        setSubmitError(
          'Please select a valid procurement source in Step 1 & 2.',
        )
        return
      }

      const payload: CreateBacResolutionPayload = {
        sourceType: selectedSourceType || undefined,
        appItemId: selectedAppItem?.id,
        consolidatedPRId: selectedConsolidatedPr?.id,
        title: value.title,
        abc: value.abc,
        resolutionType: value.resolutionType,
        bacResolutionNumber: value.resolutionNumber,
        resolutionDate: value.dateResolved,
        description: value.title,
        resolvedDateText: value.dateResolved,
        resolvedLocationText: '',
        whereasClauses: value.whereasClauseIds.map((id: string) => {
          const template = templates.find((t) => t.id === id)
          return {
            id,
            name: template?.name || '',
            body: template?.body || '',
          }
        }),
        provisionalMembers: [],
        endUserRepresentativeId: value.endUserRepresentativeId || undefined,
        techRepresentativeId: value.techRepresentativeId || undefined,
        procurementProjectContext: projectContext || undefined,
      }

      const validation = createBacResolutionSchema.safeParse({
        appItemId: selectedAppItem?.id,
        consolidatedPRId: selectedConsolidatedPr?.id,
        title: value.title,
        abc: value.abc,
        resolutionType: value.resolutionType,
        resolutionNumber: value.resolutionNumber,
        dateResolved: value.dateResolved,
        whereasClauseIds: value.whereasClauseIds,
        endUserRepresentativeId: value.endUserRepresentativeId,
        techRepresentativeId: value.techRepresentativeId,
      })

      if (!validation.success) {
        setSubmitError(
          validation.error.issues.map((issue) => issue.message).join(' '),
        )
        return
      }

      await onSubmit(payload)
      setSubmitError(null)
      onDirtyChange?.(false)
    },
  })

  // Sync title and ABC when projectContext changes
  useEffect(() => {
    if (projectContext) {
      form.setFieldValue('title', projectContext.projectTitle)
      form.setFieldValue('abc', projectContext.abc)
    }
  }, [projectContext, form])

  // Can proceed notification to parent step-aware footer
  useEffect(() => {
    if (currentStep === 1) {
      onCanProceedChange(selectedSourceType !== null)
    } else if (currentStep === 2) {
      const canProceed =
        (selectedSourceType === 'APP_ITEM' && selectedAppItem !== null) ||
        (selectedSourceType === 'CONSOLIDATED_PR' &&
          selectedConsolidatedPr !== null)
      onCanProceedChange(canProceed)
    } else if (currentStep === 3) {
      onCanProceedChange(true)
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

  return (
    <div className="space-y-6">
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
          <div className="rounded-lg border border-default-200 bg-white p-4 space-y-5">
            <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
              BAC Resolution Details
            </h4>

            {/* Title & ABC */}
            <div className="grid gap-5 md:grid-cols-3">
              <div className="md:col-span-2">
                <form.Field name="title">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Title</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        disabled={isLoading}
                        placeholder="Resolution Title..."
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">
                          <FieldInfo field={field} />
                        </p>
                      )}
                    </div>
                  )}
                </form.Field>
              </div>

              <div>
                <form.Field name="abc">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Approved Budget (ABC)</Label>
                      <Input
                        id={field.name}
                        type="number"
                        step="0.01"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) =>
                          field.handleChange(parseFloat(e.target.value) || 0)
                        }
                        disabled={isLoading}
                      />
                      {field.state.meta.errors.length > 0 && (
                        <p className="text-sm text-destructive">
                          <FieldInfo field={field} />
                        </p>
                      )}
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
                    <Label htmlFor={field.name}>Resolution Number</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="BAC-RES-2026-001"
                      disabled={isLoading}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        <FieldInfo field={field} />
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="resolutionType">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Resolution Type</Label>
                    <select
                      id={field.name}
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                      className="h-10 rounded-md border border-default-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="award-recommendation">
                        Award Recommendation
                      </option>
                      <option value="procurement-mode-recommendation">
                        Procurement Mode Recommendation
                      </option>
                    </select>
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        <FieldInfo field={field} />
                      </p>
                    )}
                  </div>
                )}
              </form.Field>

              <form.Field name="dateResolved">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Date Resolved</Label>
                    <Input
                      id={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      disabled={isLoading}
                    />
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        <FieldInfo field={field} />
                      </p>
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* Representatives Section */}
          <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4">
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                        placeholder="Select Technical Representative..."
                      />
                    )}
                  </div>
                )}
              </form.Field>
            </div>
          </div>

          {/* WHEREAS Clauses Template Selector */}
          <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4">
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
                    {isTemplatesLoading ? (
                      <div className="flex items-center text-xs text-muted-foreground py-4">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading WHEREAS clause templates...
                      </div>
                    ) : templates.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">
                        No WHEREAS clause templates available.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                        {templates.map((template) => {
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
                                disabled={isLoading}
                                className="mt-0.5"
                              />
                              <div className="flex-1 space-y-1 text-xs">
                                <span className="font-semibold text-default-900">
                                  {template.name}
                                </span>
                                <p className="text-muted-foreground line-clamp-2 leading-relaxed">
                                  {template.body}
                                </p>
                              </div>
                            </label>
                          )
                        })}
                      </div>
                    )}
                    {field.state.meta.errors.length > 0 && (
                      <p className="text-sm text-destructive">
                        <FieldInfo field={field} />
                      </p>
                    )}
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
}

