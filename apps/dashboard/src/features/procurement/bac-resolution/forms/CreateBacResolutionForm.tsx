import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import {
  ArrowDown,
  ArrowUp,
  Trash,
  ChevronRight,
  ChevronLeft,
  Calendar,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type {
  BacResolutionProvisionalMember,
  CreateBacResolutionPayload,
  ProcurementSourceType,
  AppItemLink,
  ConsolidatedPrLink,
  ProcurementProjectContext,
} from '../types'
import {
  useWhereasClauseTemplates,
  useUpdateWhereasClauseTemplate,
} from '../handlers/hooks'
import FieldInfo from '@/components/FieldInfo'
import { toast } from 'sonner'
import { fetchUsers, type User } from '@/services/api/users'
import { SourceTypeSelectorStep } from './steps/SourceTypeSelectorStep'
import { SourceRecordPickerStep } from './steps/SourceRecordPickerStep'
import { ProcurementProjectPreviewBanner } from '../components/ProcurementProjectPreviewBanner'
import { getEligibleAppItems } from '../data/mockAppItemData'
import {
  getMockConsolidatedPrs,
  getMockWhereasClauseDatabase,
} from '../data/mockBacResolutionData'

const defaultProvisionalMembers: BacResolutionProvisionalMember[] = [
  {
    id: 'provisional-end-user-rep',
    role: 'End-user Rep',
    name: '',
    position: 'End-user Representative',
  },
  {
    id: 'provisional-tech-rep',
    role: 'Tech Rep',
    name: '',
    position: 'Technical Representative',
  },
]

const clauseSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Clause name is required.'),
  body: z.string().min(1, 'Clause body is required.'),
})

export const createBacResolutionSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  abc: z.number().min(0, 'ABC must be at least 0.'),
  resolutionType: z.string().min(1, 'Resolution Type is required.'),
  bacResolutionNumber: z.string().min(1, 'BAC Resolution Number is required.'),
  resolutionDate: z.string().min(1, 'Resolution date is required.'),
  description: z.string().optional(),
  resolvedDateText: z.string().min(1, 'Resolved date text is required.'),
  resolvedLocationText: z.string().min(1, 'Resolved location is required.'),
  whereasClauses: z
    .array(clauseSchema)
    .min(1, 'At least one WHEREAS clause is required.'),
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
}

type WhereasClauseTemplate = {
  id: string
  name: string
  body: string
}

interface ManageWhereasClausesDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  templates: WhereasClauseTemplate[]
  selectedTemplateIds: string[]
  onToggleTemplate: (templateId: string) => void
  onSelectAll: () => void
  onClearAll: () => void
  isLoading: boolean
  isTemplatesLoading: boolean
}

interface SelectedWhereasClausesProps {
  selectedClauses: WhereasClauseTemplate[]
  isLoading: boolean
  onMove: (index: number, direction: -1 | 1) => void
  onRemove: (index: number) => void
  onUpdateClauseBody: (index: number, body: string) => void
  onUpdateClauseName?: (index: number, name: string) => void
  onSaveTemplateOverride: (index: number) => void
}

interface ProvisionalMembersSectionProps {
  provisionalMembers: BacResolutionProvisionalMember[]
  isLoading: boolean
  onUpdateMember: (
    index: number,
    field: 'name' | 'position',
    value: string,
  ) => void
  usersSuggestions?: User[]
}

function ManageWhereasClausesDialog({
  open,
  onOpenChange,
  templates,
  selectedTemplateIds,
  onToggleTemplate,
  onSelectAll,
  onClearAll,
  isLoading,
  isTemplatesLoading,
}: ManageWhereasClausesDialogProps) {
  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Manage WHEREAS Clauses"
      description="Select the WHEREAS clause templates to include in this BAC resolution."
      size="xl"
      footer={
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={isLoading || isTemplatesLoading || !templates?.length}
            >
              Select all
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={isLoading || !selectedTemplateIds.length}
            >
              Clear selection
            </Button>
          </div>
          <Button type="button" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-3">
        {isTemplatesLoading ? (
          <p className="text-sm text-muted-foreground">Loading clauses...</p>
        ) : !templates?.length ? (
          <p className="text-sm text-muted-foreground">
            No WHEREAS clause templates found.
          </p>
        ) : (
          <div className="space-y-3">
            {templates.map((template) => (
              <label
                key={template.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-default-200 bg-default-50 p-3 transition hover:border-primary"
              >
                <Checkbox
                  checked={selectedTemplateIds.includes(template.id)}
                  onCheckedChange={() => onToggleTemplate(template.id)}
                  disabled={isLoading}
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-sm">{template.name}</p>
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                      Template
                    </p>
                  </div>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {template.body}
                  </p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    </ResponsiveDialogDashtail>
  )
}

function SelectedWhereasClauses({
  selectedClauses,
  isLoading,
  onMove,
  onRemove,
  onUpdateClauseBody,
  onSaveTemplateOverride,
}: SelectedWhereasClausesProps) {
  if (!selectedClauses.length) {
    return (
      <div className="rounded-lg border border-dashed border-default-300 bg-white p-4 text-sm text-muted-foreground">
        No WHEREAS clauses selected yet. Click Manage WHEREAS to select saved
        templates, or Add Custom Clause to type custom ones.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-default-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>WHEREAS Clause</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {selectedClauses.map((template, index) => (
            <TableRow key={template.id || index}>
              <TableCell>
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    {!template.id ? (
                      <p className="font-semibold text-muted-foreground">
                        Custom WHEREAS Clause
                      </p>
                    ) : (
                      <p className="font-semibold">{template.name}</p>
                    )}
                    {template.id && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="xs"
                        onClick={() => onSaveTemplateOverride(index)}
                        disabled={isLoading}
                        className="text-primary hover:text-primary-focus text-xs font-semibold px-2 py-1 h-auto"
                      >
                        Override Template
                      </Button>
                    )}
                  </div>
                  <Textarea
                    value={template.body}
                    onChange={(e) => onUpdateClauseBody(index, e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    placeholder="Enter WHEREAS clause description here..."
                    className="w-full bg-white text-sm text-default-800 border-default-300 focus:border-primary focus:ring-primary"
                  />
                </div>
              </TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0 || isLoading}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onMove(index, 1)}
                    disabled={index === selectedClauses.length - 1 || isLoading}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => onRemove(index)}
                    disabled={isLoading}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function ProvisionalMembersSection({
  provisionalMembers,
  isLoading,
  onUpdateMember,
  usersSuggestions,
}: ProvisionalMembersSectionProps) {
  return (
    <div className="space-y-4 rounded-lg border border-default-200 bg-default-50 p-4">
      <div>
        <Label className="text-base font-semibold">Provisional Members</Label>
        <p className="text-sm text-muted-foreground">
          Provide the per-resolution provisional End-user and Technical
          representatives.
        </p>
      </div>

      <div className="space-y-4">
        {provisionalMembers.map((member, index) => (
          <div
            key={member.id}
            className="rounded-lg border border-default-200 bg-white p-4 shadow-sm"
          >
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <Label>Name ({member.role})</Label>
                <Input
                  value={member.name}
                  onChange={(event) =>
                    onUpdateMember(index, 'name', event.target.value)
                  }
                  disabled={isLoading}
                  list={`users-suggestions-${member.id}`}
                  placeholder="Type name to see suggestions..."
                />
                <datalist id={`users-suggestions-${member.id}`}>
                  {usersSuggestions?.map((u) => (
                    <option
                      key={u.id}
                      value={`${u.fullName} (${u.employeeNumber})`}
                    >
                      {u.officeName ? `Office: ${u.officeName}` : ''}
                    </option>
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <Label>Position</Label>
                <Input
                  value={member.position}
                  onChange={(event) =>
                    onUpdateMember(index, 'position', event.target.value)
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function CreateBacResolutionForm({
  onSubmit,
  initialValues,
  isLoading = false,
  onDirtyChange,
  formId,
}: CreateBacResolutionFormProps) {
  // Wizard Step State (1: Select Source Type, 2: Select Source Record, 3: Preview & Resolution Details)
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
  const [selectedSourceType, setSelectedSourceType] =
    useState<ProcurementSourceType | null>(initialValues?.sourceType ?? null)

  // Datasets for Step 2
  const appItemsPool = useMemo(() => getEligibleAppItems(), [])
  const consolidatedPrsPool = useMemo(() => getMockConsolidatedPrs(), [])

  const [selectedAppItem, setSelectedAppItem] = useState<AppItemLink | null>(
    null,
  )
  const [selectedConsolidatedPr, setSelectedConsolidatedPr] =
    useState<ConsolidatedPrLink | null>(null)

  // Authoritative Procurement Project Context
  const projectContext = useMemo<ProcurementProjectContext | null>(() => {
    if (selectedSourceType === 'APP_ITEM' && selectedAppItem) {
      return {
        sourceType: 'APP_ITEM',
        sourceRef: `${selectedAppItem.appNumber} / ${selectedAppItem.itemNumber}`,
        projectTitle: selectedAppItem.description,
        officeName: selectedAppItem.officeName,
        modeOfProcurement: selectedAppItem.modeOfProcurement,
        sourceOfFund: selectedAppItem.sourceOfFund,
        abc: selectedAppItem.abc,
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
        modeOfProcurement: selectedConsolidatedPr.modeOfProcurement,
        sourceOfFund: 'General Appropriations Act (GAA)',
        abc: selectedConsolidatedPr.amount,
      }
    }

    return null
  }, [selectedSourceType, selectedAppItem, selectedConsolidatedPr])

  const { data: apiTemplates, isLoading: isTemplatesLoading } =
    useWhereasClauseTemplates({})
  const templates = useMemo(() => {
    if (apiTemplates && apiTemplates.length > 0) return apiTemplates
    return getMockWhereasClauseDatabase().map((t) => ({
      id: t.id,
      name: t.name,
      body: t.body,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }))
  }, [apiTemplates])
  const { mutateAsync: updateTemplate } = useUpdateWhereasClauseTemplate()
  const [selectedClauses, setSelectedClauses] = useState<
    WhereasClauseTemplate[]
  >(
    initialValues?.whereasClauses?.map((c) => ({
      id: c.id ?? '',
      name: c.name,
      body: c.body,
      createdAt: '',
      updatedAt: '',
    })) ?? [],
  )

  const resolvedDatePickerRef = useRef<HTMLInputElement | null>(null)
  const openResolvedDatePicker = () => {
    const picker = resolvedDatePickerRef.current
    if (!picker) return
    if (typeof picker.showPicker === 'function') {
      picker.showPicker()
    } else {
      picker.focus()
    }
  }

  const selectedTemplateIds = useMemo(() => {
    return selectedClauses.map((c) => c.id).filter(Boolean)
  }, [selectedClauses])

  const [isManageWhereasOpen, setIsManageWhereasOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => console.error('Failed to load user suggestions:', err))
  }, [])

  const [provisionalMembers, setProvisionalMembers] = useState<
    CreateBacResolutionPayload['provisionalMembers']
  >([])

  useEffect(() => {
    const initial =
      initialValues?.provisionalMembers ?? defaultProvisionalMembers
    if (users.length > 0) {
      const resolved = initial.map((member) => {
        if (member.userId) return member
        const found = users.find(
          (u) => u.fullName.toLowerCase() === member.name.trim().toLowerCase(),
        )
        return {
          ...member,
          userId: found?.id || null,
        }
      })
      setProvisionalMembers(resolved)
    } else {
      setProvisionalMembers(initial)
    }
  }, [initialValues, users])

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [overrideIndex, setOverrideIndex] = useState<number | null>(null)

  const defaultResNumber = `BAC-RES-2026-${Math.floor(100 + Math.random() * 900)}`

  const form = useForm({
    defaultValues: {
      title: initialValues?.title ?? projectContext?.projectTitle ?? '',
      abc: initialValues?.abc ?? projectContext?.abc ?? 0,
      resolutionType: initialValues?.resolutionType ?? 'Standard',
      bacResolutionNumber:
        initialValues?.bacResolutionNumber ?? defaultResNumber,
      resolutionDate:
        initialValues?.resolutionDate ?? new Date().toISOString().split('T')[0],
      description:
        initialValues?.description ?? projectContext?.projectTitle ?? '',
      resolvedDateText:
        initialValues?.resolvedDateText ??
        new Date().toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      resolvedLocationText:
        initialValues?.resolvedLocationText ??
        'University of Science and Technology of Southern Philippines, Cagayan de Oro City',
    },
    validators: {},
    onSubmit: async ({ value }) => {
      if (!selectedSourceType || !projectContext) {
        toast.error('Please select a valid procurement source in Step 1 & 2.')
        return
      }

      const endUserRep = provisionalMembers.find(
        (m) => m.id === 'provisional-end-user-rep' || m.role === 'End-user Rep',
      )
      const techRep = provisionalMembers.find(
        (m) => m.id === 'provisional-tech-rep' || m.role === 'Tech Rep',
      )

      const payload: CreateBacResolutionPayload = {
        ...value,
        title: projectContext.projectTitle,
        abc: projectContext.abc,
        description:
          value.description ||
          projectContext.projectTitle ||
          'Untitled BAC Resolution',
        whereasClauses: selectedClauses.map((template) => ({
          id: template.id,
          name: template.name,
          body: template.body,
        })),
        provisionalMembers: provisionalMembers.map((m) => ({
          id: m.id,
          role: m.role,
          name: m.name,
          position: m.position,
        })),
        endUserRepresentativeId: endUserRep?.userId || null,
        techRepresentativeId: techRep?.userId || null,
        // Multi-source fields
        sourceType: selectedSourceType,
        appItemId: selectedAppItem?.id || null,
        consolidatedPRId: selectedConsolidatedPr?.id || null,
        procurementProjectContext: projectContext,
      }

      const validation = createBacResolutionSchema.safeParse(payload)
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
      form.setFieldValue('description', projectContext.projectTitle)
    }
  }, [projectContext, form])

  const isClausesDirty = selectedTemplateIds.length > 0
  const isProvisionalDirty = provisionalMembers.some(
    (member, index) =>
      member.name.trim() !== defaultProvisionalMembers[index]?.name ||
      member.position.trim() !== defaultProvisionalMembers[index]?.position,
  )

  useEffect(() => {
    onDirtyChange?.(
      form.state.isDirty ||
        isClausesDirty ||
        isProvisionalDirty ||
        currentStep > 1,
    )
  }, [
    form.state.isDirty,
    isClausesDirty,
    isProvisionalDirty,
    currentStep,
    onDirtyChange,
  ])

  const toggleTemplateSelection = (templateId: string) => {
    setSelectedClauses((current) => {
      const exists = current.some((c) => c.id === templateId)
      if (exists) {
        return current.filter((c) => c.id !== templateId)
      } else {
        const template = templates?.find((t) => t.id === templateId)
        return template ? [...current, { ...template }] : current
      }
    })
  }

  const selectAllTemplates = () => {
    if (!templates) return
    setSelectedClauses(templates.map((template) => ({ ...template })))
  }

  const clearAllTemplates = () => {
    setSelectedClauses([])
  }

  const moveClause = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction
    if (nextIndex < 0 || nextIndex >= selectedClauses.length) return
    setSelectedClauses((current) => {
      const result = [...current]
      const item = result[index]
      result[index] = result[nextIndex]
      result[nextIndex] = item
      return result
    })
  }

  const removeClause = (index: number) => {
    setSelectedClauses((current) => current.filter((_, i) => i !== index))
  }

  const updateClauseBody = (index: number, body: string) => {
    setSelectedClauses((current) =>
      current.map((item, i) => (i === index ? { ...item, body } : item)),
    )
  }

  const updateClauseName = (index: number, name: string) => {
    setSelectedClauses((current) =>
      current.map((item, i) => (i === index ? { ...item, name } : item)),
    )
  }

  const addCustomClause = () => {
    setSelectedClauses((current) => [
      ...current,
      {
        id: '',
        name: 'WHEREAS, ',
        body: '',
        createdAt: '',
        updatedAt: '',
      },
    ])
  }

  const handleSaveTemplateOverride = (index: number) => {
    setOverrideIndex(index)
  }

  const confirmOverride = async () => {
    if (overrideIndex === null) return
    const clause = selectedClauses[overrideIndex]
    if (!clause || !clause.id) {
      setOverrideIndex(null)
      return
    }
    try {
      await updateTemplate({
        pathParams: { id: clause.id },
        payload: {
          name: clause.name,
          body: clause.body,
        },
      })
      toast.success('Template updated successfully.')
    } catch (e) {
      toast.error('Failed to update template.')
      console.error(e)
    } finally {
      setOverrideIndex(null)
    }
  }

  const updateProvisionalMember = (
    index: number,
    field: 'name' | 'position',
    value: string,
  ) => {
    setProvisionalMembers((current) =>
      current.map((member, i) => {
        if (i !== index) return member

        if (field === 'name') {
          const matchedUser = users.find(
            (u) =>
              `${u.fullName} (${u.employeeNumber})`.toLowerCase() ===
              value.trim().toLowerCase(),
          )
          return {
            ...member,
            name: value,
            userId: matchedUser ? matchedUser.id : null,
          }
        }

        return {
          ...member,
          [field]: value,
        }
      }),
    )
  }

  const canProceedToStep2 = selectedSourceType !== null
  const canProceedToStep3 =
    (selectedSourceType === 'APP_ITEM' && selectedAppItem !== null) ||
    (selectedSourceType === 'CONSOLIDATED_PR' &&
      selectedConsolidatedPr !== null)

  return (
    <>
      <div className="space-y-6">
        {/* Stepper Navigation Indicator Header */}
        <div className="flex items-center justify-between border-b border-default-200 pb-4">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 1
                  ? 'bg-primary text-white'
                  : currentStep > 1
                    ? 'bg-emerald-600 text-white'
                    : 'bg-default-200 text-default-600'
              }`}
            >
              1
            </span>
            <span
              className={`text-xs font-semibold ${currentStep === 1 ? 'text-primary' : 'text-default-700'}`}
            >
              Select Source Type
            </span>

            <ChevronRight className="h-4 w-4 text-default-400" />

            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 2
                  ? 'bg-primary text-white'
                  : currentStep > 2
                    ? 'bg-emerald-600 text-white'
                    : 'bg-default-200 text-default-600'
              }`}
            >
              2
            </span>
            <span
              className={`text-xs font-semibold ${currentStep === 2 ? 'text-primary' : 'text-default-700'}`}
            >
              Pick Source Record
            </span>

            <ChevronRight className="h-4 w-4 text-default-400" />

            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                currentStep === 3
                  ? 'bg-primary text-white'
                  : 'bg-default-200 text-default-600'
              }`}
            >
              3
            </span>
            <span
              className={`text-xs font-semibold ${currentStep === 3 ? 'text-primary' : 'text-default-700'}`}
            >
              BAC Resolution Details
            </span>
          </div>

          {/* Stepper controls */}
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep((prev) => (prev - 1) as 1 | 2)}
                className="gap-1 text-xs"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            )}

            {currentStep === 1 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentStep(2)}
                disabled={!canProceedToStep2}
                className="gap-1 text-xs"
              >
                Next Step
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                type="button"
                size="sm"
                onClick={() => setCurrentStep(3)}
                disabled={!canProceedToStep3}
                className="gap-1 text-xs"
              >
                Next: BAC Details
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
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
            appItems={appItemsPool}
            consolidatedPrs={consolidatedPrsPool}
            selectedAppItem={selectedAppItem}
            selectedConsolidatedPr={selectedConsolidatedPr}
            onSelectAppItem={setSelectedAppItem}
            onSelectConsolidatedPr={setSelectedConsolidatedPr}
          />
        )}

        {/* STEP 3: PREVIEW & BAC RESOLUTION DETAILS FORM */}
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

            {/* BAC Resolution Specific Details */}
            <div className="rounded-lg border border-default-200 bg-white p-4 space-y-5">
              <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
                BAC Resolution Information
              </h4>

              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="bacResolutionNumber">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>BAC Resolution Number</Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
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

                <form.Field name="resolutionDate">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>Resolution Date</Label>
                      <Input
                        id={field.name}
                        type="date"
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
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

              <div className="grid gap-5 md:grid-cols-2">
                <form.Field name="resolvedDateText">
                  {(field) => {
                    const currentDateValue = (() => {
                      const parsed = new Date(field.state.value)
                      return !isNaN(parsed.getTime())
                        ? parsed.toISOString().split('T')[0]
                        : ''
                    })()

                    return (
                      <div className="grid gap-2">
                        <Label htmlFor={field.name}>
                          Resolved Date Wording
                        </Label>
                        <div className="flex gap-2 items-center">
                          <Input
                            id={field.name}
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(event) =>
                              field.handleChange(event.target.value)
                            }
                            placeholder="e.g. December 31, 2026"
                            disabled={isLoading}
                            className="flex-1"
                          />
                          <input
                            ref={resolvedDatePickerRef}
                            type="date"
                            value={currentDateValue}
                            onChange={(event) => {
                              const dateVal = event.target.value
                              if (!dateVal) return
                              const dateObj = new Date(dateVal)
                              if (!isNaN(dateObj.getTime())) {
                                field.handleChange(
                                  dateObj.toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  }),
                                )
                              }
                            }}
                            className="sr-only"
                            disabled={isLoading}
                            aria-hidden="true"
                            tabIndex={-1}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 h-[40px]"
                            onClick={openResolvedDatePicker}
                            disabled={isLoading}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                        {field.state.meta.errors.length > 0 && (
                          <p className="text-sm text-destructive">
                            <FieldInfo field={field} />
                          </p>
                        )}
                      </div>
                    )
                  }}
                </form.Field>

                <form.Field name="resolvedLocationText">
                  {(field) => (
                    <div className="grid gap-2">
                      <Label htmlFor={field.name}>
                        Resolved Location Wording
                      </Label>
                      <Input
                        id={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        placeholder="University of Science and Technology of Southern Philippines, Cagayan de Oro City"
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

            {/* WHEREAS Clauses Section */}
            <div className="space-y-4 rounded-lg border border-default-200 bg-default-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Label className="text-base font-semibold">
                    WHEREAS Clauses
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Selected WHEREAS clause templates will appear below. Use
                    Manage WHEREAS to choose saved clause templates or Add
                    Custom Clause to define custom ones.
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addCustomClause}
                    disabled={isLoading}
                  >
                    Add Custom Clause
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setIsManageWhereasOpen(true)}
                    disabled={isLoading || isTemplatesLoading}
                  >
                    Manage WHEREAS
                  </Button>
                </div>
              </div>
            </div>

            <SelectedWhereasClauses
              selectedClauses={selectedClauses}
              isLoading={isLoading}
              onMove={moveClause}
              onRemove={removeClause}
              onUpdateClauseBody={updateClauseBody}
              onUpdateClauseName={updateClauseName}
              onSaveTemplateOverride={handleSaveTemplateOverride}
            />

            <ManageWhereasClausesDialog
              open={isManageWhereasOpen}
              onOpenChange={setIsManageWhereasOpen}
              templates={templates ?? []}
              selectedTemplateIds={selectedTemplateIds}
              onToggleTemplate={toggleTemplateSelection}
              onSelectAll={selectAllTemplates}
              onClearAll={clearAllTemplates}
              isLoading={isLoading}
              isTemplatesLoading={isTemplatesLoading}
            />

            {submitError ? (
              <p className="text-sm text-destructive">{submitError}</p>
            ) : null}

            <ProvisionalMembersSection
              provisionalMembers={provisionalMembers}
              isLoading={isLoading}
              onUpdateMember={updateProvisionalMember}
              usersSuggestions={users}
            />
          </form>
        )}
      </div>

      <ConfirmAlertDialog
        open={overrideIndex !== null}
        onOpenChange={(open) => !open && setOverrideIndex(null)}
        title="Override Template?"
        description="Are you sure you want to update this WHEREAS clause template? This will modify the shared template definition for all resolutions."
        onConfirm={confirmOverride}
        confirmLabel="Override"
        cancelLabel="Cancel"
      />
    </>
  )
}
