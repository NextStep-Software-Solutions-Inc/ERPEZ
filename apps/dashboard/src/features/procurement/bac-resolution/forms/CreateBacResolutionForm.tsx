import { useEffect, useMemo, useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import {
  ArrowDown,
  ArrowUp,
  Trash,
  Search,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  BacResolutionProvisionalMember,
  CreateBacResolutionPayload,
} from '../types'
import {
  useWhereasClauseTemplates,
  useUpdateWhereasClauseTemplate,
  useGetUsers,
} from '../handlers/hooks'
import { CreateBACProjectPayload } from '../handlers/createBacProjectRequest'
import FieldInfo from '@/components/FieldInfo'
import { toast } from 'sonner'
import type { User } from '@/services/api/users'
import { createQueryHookFromTemplate } from 'erpez-shared-lib'
import { getAPPItemsRequest } from '@/features/planning/app-consolidation/handlers/getAPPItemsRequest'
import { useConsolidatedPrs } from '@/features/procurement/consolidated-pr/handlers/hooks'

const useAPPItems = createQueryHookFromTemplate(getAPPItemsRequest)

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

export const createBacResolutionSchema = z
  .object({
    title: z.string().min(1, 'Title is required.'),
    abc: z.number().min(0, 'ABC must be at least 0.'),
    resolutionType: z.string().min(1, 'Resolution Type is required.'),
    bacResolutionNumber: z
      .string()
      .min(3, 'Resolution Number must be between 3 and 50 characters.')
      .max(50, 'Resolution Number must be between 3 and 50 characters.'),
    resolutionDate: z.string().min(1, 'Resolution date is required.'),
    description: z.string().optional(),
    resolvedDateText: z.string().min(1, 'Resolved date text is required.'),
    resolvedLocationText: z
      .string()
      .min(1, 'Resolved Location is required.')
      .max(200, 'Resolved Location cannot exceed 200 characters.'),
    whereasClauses: z
      .array(clauseSchema)
      .min(1, 'At least one WHEREAS clause is required.'),
    sourceType: z.enum(['AppItem', 'ConsolidatedPR']),
    appItemId: z.string().optional().nullable(),
    consolidatedPRId: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.sourceType === 'AppItem') {
        return !!data.appItemId
      }
      return true
    },
    {
      message:
        'The selected APP Item is either not found, not approved, or already linked to a project.',
      path: ['appItemId'],
    },
  )
  .refine(
    (data) => {
      if (data.sourceType === 'ConsolidatedPR') {
        return !!data.consolidatedPRId
      }
      return true
    },
    {
      message:
        'The selected Consolidated PR is either not found, not approved, or already linked to a project.',
      path: ['consolidatedPRId'],
    },
  )

export type CreateBacResolutionFormValues = z.infer<
  typeof createBacResolutionSchema
>

interface CreateBacResolutionFormProps {
  onSubmit: (values: CreateBACProjectPayload) => Promise<void> | void
  onCancel: () => void
  initialValues?: Partial<CreateBacResolutionPayload>
  isLoading?: boolean
  onDirtyChange?: (isDirty: boolean) => void
  formId?: string
  apiAppItems?: any[]
  apiConsolidatedPrs?: any[]
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
  const [searchQuery, setSearchQuery] = useState('')

  const filteredTemplates = useMemo(() => {
    if (!templates) return []
    return templates.filter(
      (t) =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.body.toLowerCase().includes(searchQuery.toLowerCase()),
    )
  }, [templates, searchQuery])

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={onOpenChange}
      title="Manage WHEREAS Templates"
      description="Select template clauses to include in the BAC Resolution"
      size="md"
      showCloseButton
      footer={
        <div className="flex gap-2 w-full justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSelectAll}
              disabled={isLoading || isTemplatesLoading}
            >
              Select All
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClearAll}
              disabled={isLoading || isTemplatesLoading}
            >
              Clear All
            </Button>
          </div>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Done
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search templates..."
            className="pl-8"
          />
        </div>

        <div className="max-h-75 overflow-y-auto space-y-2 pr-1">
          {isTemplatesLoading ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Loading templates...
            </p>
          ) : filteredTemplates.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No templates found.
            </p>
          ) : (
            filteredTemplates.map((template) => {
              const isChecked = selectedTemplateIds.includes(template.id)
              return (
                <div
                  key={template.id}
                  onClick={() => onToggleTemplate(template.id)}
                  className="flex items-start space-x-3 rounded-md border p-3 hover:bg-default-50 cursor-pointer transition-colors"
                >
                  <Checkbox
                    id={`template-${template.id}`}
                    checked={isChecked}
                    onCheckedChange={() => onToggleTemplate(template.id)}
                    onClick={(e) => e.stopPropagation()}
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`template-${template.id}`}
                      className="text-sm font-semibold leading-none cursor-pointer"
                    >
                      {template.name}
                    </label>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {template.body}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>
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
  onUpdateClauseName,
  onSaveTemplateOverride,
}: SelectedWhereasClausesProps) {
  if (selectedClauses.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center bg-default-50">
        <p className="text-sm text-muted-foreground">
          No clauses added yet. Click Add Custom Clause or Manage WHEREAS
          templates to start.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {selectedClauses.map((clause, index) => {
        const isCustom = !clause.id
        return (
          <div
            key={clause.id || `custom-${index}`}
            className="flex gap-4 items-start rounded-lg border p-4 bg-default-50 hover:shadow-sm transition-shadow"
          >
            <div className="grid gap-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  Clause {index + 1} {isCustom ? '(Custom)' : '(Template)'}
                </span>
                <Input
                  value={clause.name}
                  onChange={(e) => onUpdateClauseName?.(index, e.target.value)}
                  placeholder="e.g. Legal Basis"
                  className="max-w-50 h-7 text-xs font-semibold px-2 py-0.5"
                  disabled={isLoading}
                />
                {!isCustom && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-xs text-primary"
                    onClick={() => onSaveTemplateOverride(index)}
                    disabled={isLoading}
                  >
                    Save Template Override
                  </Button>
                )}
              </div>
              <Textarea
                value={clause.body}
                onChange={(e) => onUpdateClauseBody(index, e.target.value)}
                placeholder="WHEREAS, Section 12 of R.A. 9184..."
                className="min-h-20 text-sm"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col gap-1.5 self-center">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-default-500"
                onClick={() => onMove(index, -1)}
                disabled={isLoading || index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-default-500"
                onClick={() => onMove(index, 1)}
                disabled={isLoading || index === selectedClauses.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                onClick={() => onRemove(index)}
                disabled={isLoading}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

interface ProvisionalMembersSectionProps {
  provisionalMembers: BacResolutionProvisionalMember[]
  isLoading: boolean
  onUpdateMember: (
    index: number,
    field: 'name' | 'position' | 'userId',
    value: string,
  ) => void
  usersSuggestions: User[]
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
        <Label className="text-base font-semibold">
          Provisional Signatories
        </Label>
        <p className="text-sm text-muted-foreground">
          Define the provisional members representing the end-user office and
          technical reviews.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {provisionalMembers.map((member, index) => (
          <div
            key={member.id}
            className="rounded-md border p-4 bg-background space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-2">
              <span className="text-sm font-bold text-primary">
                {member.role}
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor={`member-user-${member.id}`}>Select User</Label>
                <Select
                  value={member.userId || ''}
                  onValueChange={(value) =>
                    onUpdateMember(index, 'userId', value)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id={`member-user-${member.id}`}>
                    <SelectValue placeholder="Choose a user" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">-- Select User --</SelectItem>
                    {usersSuggestions.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.fullName} ({user.employeeNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor={`member-name-${member.id}`}>Full Name</Label>
                <Input
                  id={`member-name-${member.id}`}
                  value={member.name}
                  onChange={(event) =>
                    onUpdateMember(index, 'name', event.target.value)
                  }
                  placeholder="Enter or select name"
                  disabled={isLoading}
                  className="w-full"
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor={`member-position-${member.id}`}>
                  Position / Title
                </Label>
                <Input
                  id={`member-position-${member.id}`}
                  value={member.position}
                  onChange={(event) =>
                    onUpdateMember(index, 'position', event.target.value)
                  }
                  disabled={isLoading}
                  placeholder="e.g. Director / Representative"
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
  onCancel,
  initialValues,
  isLoading = false,
  onDirtyChange,
  formId,
  apiAppItems: propApiAppItems = [],
  apiConsolidatedPrs: propApiConsolidatedPrs = [],
}: CreateBacResolutionFormProps) {
  const { data: templates, isLoading: isTemplatesLoading } =
    useWhereasClauseTemplates({})
  const { mutateAsync: updateTemplate } = useUpdateWhereasClauseTemplate()

  // Fetch APP Items using the blueprint hook
  const { data: appItemsResponse, isLoading: isLoadingAppItems } = useAPPItems({
    pathParams: {},
    queryParams: { pageNumber: 1, pageSize: 1000 },
  })

  // Fetch Consolidated PRs using the hook
  const { data: consolidatedPrsResponse, isLoading: isLoadingConsolidatedPrs } =
    useConsolidatedPrs({
      pathParams: {},
      queryParams: { PageNumber: 1, PageSize: 1000 },
    })

  const apiAppItems = useMemo(() => {
    return propApiAppItems.length > 0
      ? propApiAppItems
      : (appItemsResponse?.data ?? [])
  }, [propApiAppItems, appItemsResponse])

  const apiConsolidatedPrs = useMemo(() => {
    return propApiConsolidatedPrs.length > 0
      ? propApiConsolidatedPrs
      : (consolidatedPrsResponse?.data ?? [])
  }, [propApiConsolidatedPrs, consolidatedPrsResponse])

  // If initialValues contains details (edit mode), start at step 4
  const [step, setStep] = useState<1 | 2 | 3 | 4>(
    initialValues?.bacResolutionNumber ? 4 : 1,
  )

  const [sourceType, setSourceType] = useState<'AppItem' | 'ConsolidatedPR'>(
    () => {
      if (initialValues?.consolidatedPRId) return 'ConsolidatedPR'
      return 'AppItem'
    },
  )

  const [selectedAppItemId, setSelectedAppItemId] = useState<string | null>(
    initialValues?.appItemId || null,
  )
  const [selectedConsolidatedPRId, setSelectedConsolidatedPRId] = useState<
    string | null
  >(initialValues?.consolidatedPRId || null)
  const [searchQuery, setSearchQuery] = useState('')

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

  // Fetch users using the query hook
  const { data: usersResponse } = useGetUsers({
    pathParams: {},
    queryParams: { PageNumber: 1, PageSize: 100 },
  })
  const users = usersResponse?.data || []

  const [provisionalMembers, setProvisionalMembers] = useState<
    BacResolutionProvisionalMember[]
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

  const calculateAppItemBudget = (item: any) => {
    if (!item) return 0
    // Try direct ABC property first (from new API response)
    if (item.abc !== undefined && item.abc !== null && item.abc !== 0)
      return item.abc
    // Fallback to amount property
    if (item.amount !== undefined && item.amount !== null && item.amount !== 0)
      return item.amount
    // Calculate from PPMP item if available
    if (!item.ppmpItem) return 0
    const qty =
      item.ppmpItem.ppmpItemAllocations?.reduce(
        (sum: number, a: any) => sum + (a.quantity || 0),
        0,
      ) || 0
    return item.ppmpItem.unitPrice * qty
  }

  const selectedAppItem = useMemo(() => {
    return apiAppItems.find((i) => i.id === selectedAppItemId)
  }, [apiAppItems, selectedAppItemId])

  const selectedConsolidatedPR = useMemo(() => {
    return apiConsolidatedPrs.find((c) => c.id === selectedConsolidatedPRId)
  }, [apiConsolidatedPrs, selectedConsolidatedPRId])

  const filteredAppItems = useMemo(() => {
    // First filter to only approved APP Items
    const approvedItems = apiAppItems.filter(
      (item) => item.APP?.status === 'Approved' || item.APP?.status === '2',
    )

    if (!searchQuery) return approvedItems
    const query = searchQuery.toLowerCase()
    return approvedItems.filter((item) => {
      const name =
        item.PPMPItemName?.toLowerCase() ||
        item.ppmpItem?.name?.toLowerCase() ||
        ''
      const desc = item.ppmpItem?.description?.toLowerCase() || ''
      const office =
        item.OfficeName?.toLowerCase() || item.office?.name?.toLowerCase() || ''
      return (
        name.includes(query) || desc.includes(query) || office.includes(query)
      )
    })
  }, [apiAppItems, searchQuery])

  const filteredConsolidatedPrs = useMemo(() => {
    if (!searchQuery) return apiConsolidatedPrs
    const query = searchQuery.toLowerCase()
    return apiConsolidatedPrs.filter((cpr) => {
      const num =
        cpr.cprNumber?.toLowerCase() || cpr.prNumber?.toLowerCase() || ''
      const desc = cpr.description?.toLowerCase() || ''
      const purpose = cpr.purpose?.toLowerCase() || ''
      return (
        num.includes(query) || desc.includes(query) || purpose.includes(query)
      )
    })
  }, [apiConsolidatedPrs, searchQuery])

  const form = useForm({
    defaultValues: {
      title: initialValues?.title ?? '',
      abc: initialValues?.abc ?? 0,
      resolutionType: initialValues?.resolutionType ?? 'Standard',
      bacResolutionNumber:
        initialValues?.bacResolutionNumber ??
        `BAC-RES-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
      resolutionDate:
        initialValues?.resolutionDate ?? new Date().toISOString().split('T')[0],
      description: initialValues?.description ?? '',
      resolvedDateText:
        initialValues?.resolvedDateText ??
        new Date().toLocaleDateString('en-PH', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
      resolvedLocationText:
        initialValues?.resolvedLocationText ??
        'University of Science and Technology of Southern Philippines, Cagayan de Oro City',
    },
    onSubmit: async ({ value }) => {
      // Validate required fields before submission
      if (
        !value.bacResolutionNumber ||
        value.bacResolutionNumber.trim().length < 3
      ) {
        setSubmitError(
          'Resolution Number is required and must be at least 3 characters.',
        )
        return
      }

      if (
        !value.resolvedLocationText ||
        value.resolvedLocationText.trim().length === 0
      ) {
        setSubmitError('Resolved Location is required.')
        return
      }

      if (sourceType === 'AppItem' && !selectedAppItemId) {
        setSubmitError('Please select an APP Item.')
        return
      }

      if (sourceType === 'ConsolidatedPR' && !selectedConsolidatedPRId) {
        setSubmitError('Please select a Consolidated PR.')
        return
      }

      const endUserRep = provisionalMembers.find(
        (m) => m.id === 'provisional-end-user-rep' || m.role === 'End-user Rep',
      )
      const techRep = provisionalMembers.find(
        (m) => m.id === 'provisional-tech-rep' || m.role === 'Tech Rep',
      )

      // Auto-prepopulate clauses if still empty in step 4
      const clausesToSubmit =
        selectedClauses.length > 0
          ? selectedClauses
          : (templates ?? []).slice(0, 2)

      // Map form data to CreateBACProjectPayload
      const payload: CreateBACProjectPayload = {
        title:
          value.title ||
          (sourceType === 'AppItem'
            ? selectedAppItem?.PPMPItemName || selectedAppItem?.ppmpItem?.name
            : selectedConsolidatedPR?.description) ||
          'BAC Resolution Project',
        abc:
          value.abc ||
          (sourceType === 'AppItem'
            ? calculateAppItemBudget(selectedAppItem)
            : selectedConsolidatedPR?.totalAmount) ||
          0,
        sourceType: sourceType,
        appItemId:
          sourceType === 'AppItem' ? selectedAppItemId || undefined : undefined,
        consolidatedPRId:
          sourceType === 'ConsolidatedPR'
            ? selectedConsolidatedPRId || undefined
            : undefined,
        resolutionType: value.resolutionType,
        resolutionNumber: value.bacResolutionNumber.trim(),
        dateResolved: value.resolutionDate,
        resolvedLocation: value.resolvedLocationText.trim(),
        selectedTemplateClauseIds: clausesToSubmit
          .map((c) => c.id)
          .filter(Boolean),
        customClauses: clausesToSubmit
          .filter((c) => !c.id || c.id === '')
          .map((c) => c.body),
        endUserRepresentativeId: endUserRep?.userId || undefined,
        techRepresentativeId: techRep?.userId || undefined,
        userId: '61a2206a-a15b-4512-8668-7d48f29b3fed', // Current user ID - should be from auth context
      }

      try {
        await onSubmit(payload)
        setSubmitError(null)
        onDirtyChange?.(false)
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.errors || error?.message || 'Submission failed'
        if (typeof errorMessage === 'object') {
          const errorList = Object.entries(errorMessage)
            .map(([field, messages]: any) => {
              if (Array.isArray(messages)) {
                return messages.join(' ')
              }
              return messages
            })
            .join(' | ')
          setSubmitError(errorList)
        } else {
          setSubmitError(errorMessage)
        }
      }
    },
  })

  // Set default clauses when templates load
  useEffect(() => {
    if (templates && templates.length > 0 && selectedClauses.length === 0) {
      setSelectedClauses(templates.map((t) => ({ ...t })))
    }
  }, [templates])

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2)
      setSearchQuery('')
    } else if (step === 2) {
      if (sourceType === 'AppItem' && !selectedAppItemId) {
        toast.error('Please select an APP Item.')
        return
      }
      if (sourceType === 'ConsolidatedPR' && !selectedConsolidatedPRId) {
        toast.error('Please select a Consolidated PR.')
        return
      }
      setStep(3)
    } else if (step === 3) {
      // Prepopulate form values from chosen source
      if (sourceType === 'AppItem' && selectedAppItem) {
        form.setFieldValue(
          'title',
          selectedAppItem.ppmpItem?.name || 'Procurement Project',
        )
        form.setFieldValue('abc', calculateAppItemBudget(selectedAppItem))
        form.setFieldValue(
          'description',
          selectedAppItem.ppmpItem?.description || '',
        )
      } else if (sourceType === 'ConsolidatedPR' && selectedConsolidatedPR) {
        form.setFieldValue(
          'title',
          selectedConsolidatedPR.description ||
            'Consolidated Procurement Project',
        )
        form.setFieldValue('abc', selectedConsolidatedPR.totalAmount)
        form.setFieldValue('description', selectedConsolidatedPR.purpose || '')
      }
      setStep(4)
    }
  }

  const handlePrevStep = () => {
    if (step > 1) {
      setStep((s) => (s - 1) as any)
    }
  }

  const isClausesDirty = selectedTemplateIds.length > 0
  const isProvisionalDirty = provisionalMembers.some(
    (member, index) =>
      member.name.trim() !== defaultProvisionalMembers[index]?.name ||
      member.position.trim() !== defaultProvisionalMembers[index]?.position,
  )

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty || isClausesDirty || isProvisionalDirty)
  }, [form.state.isDirty, isClausesDirty, isProvisionalDirty, onDirtyChange])

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
    field: 'name' | 'position' | 'userId',
    value: string,
  ) => {
    setProvisionalMembers((current) =>
      current.map((member, i) => {
        if (i !== index) return member

        if (field === 'userId') {
          // When user ID is selected, update both userId and name
          const selectedUser = users.find((u) => u.id === value)
          return {
            ...member,
            userId: value || null,
            name: selectedUser ? selectedUser.fullName : member.name,
          }
        }

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

  return (
    <div className="space-y-6">
      {/* Visual Step Progress Indicator */}
      <div className="flex items-center justify-between border-b pb-4 mb-2">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            type="button"
            disabled={step < 1}
            onClick={() => step > 1 && setStep(1)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 1
                ? 'bg-primary text-white scale-105'
                : 'bg-default-100 text-default-600 hover:bg-default-200'
            }`}
          >
            1. Source Selection
          </button>
          <span className="text-default-400 text-xs">/</span>
          <button
            type="button"
            disabled={step < 2}
            onClick={() => step > 2 && setStep(2)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 2
                ? 'bg-primary text-white scale-105'
                : 'bg-default-100 text-default-600 hover:bg-default-200'
            }`}
          >
            2. Search & Select
          </button>
          <span className="text-default-400 text-xs">/</span>
          <button
            type="button"
            disabled={step < 3}
            onClick={() => step > 3 && setStep(3)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 3
                ? 'bg-primary text-white scale-105'
                : 'bg-default-100 text-default-600 hover:bg-default-200'
            }`}
          >
            3. Preview Source
          </button>
          <span className="text-default-400 text-xs">/</span>
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              step === 4
                ? 'bg-primary text-white scale-105'
                : 'bg-default-100 text-default-600'
            }`}
          >
            4. Fill Details
          </span>
        </div>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold block">
            Choose Procurement Source Type
          </Label>
          <p className="text-sm text-muted-foreground">
            A BAC Resolution can be initiated either from an individual approved
            APP Item or from a Consolidated Purchase Request.
          </p>
          <div className="grid gap-5 sm:grid-cols-2 pt-2">
            <div
              onClick={() => setSourceType('AppItem')}
              className={`rounded-xl border p-6 cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 ${
                sourceType === 'AppItem'
                  ? 'border-primary ring-2 ring-primary bg-primary/5 shadow-sm'
                  : 'border-default-200 bg-background hover:border-default-400'
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                A
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">
                  Annual Procurement Plan (APP) Item
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a resolution directly from an approved line item in the
                  Annual Procurement Plan. Best for standalone purchases.
                </p>
              </div>
            </div>

            <div
              onClick={() => setSourceType('ConsolidatedPR')}
              className={`rounded-xl border p-6 cursor-pointer hover:shadow-md transition-all flex flex-col gap-3 ${
                sourceType === 'ConsolidatedPR'
                  ? 'border-primary ring-2 ring-primary bg-primary/5 shadow-sm'
                  : 'border-default-200 bg-background hover:border-default-400'
              }`}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                B
              </div>
              <div>
                <h4 className="font-bold text-base text-foreground">
                  Consolidated Purchase Request (CPR)
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a resolution from a Consolidated Purchase Request. Best
                  for grouped end-user requisitions.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-lg font-semibold">
              Search and Select{' '}
              {sourceType === 'AppItem' ? 'APP Item' : 'Consolidated PR'}
            </Label>
            <p className="text-sm text-muted-foreground">
              Search the database for approved{' '}
              {sourceType === 'AppItem'
                ? 'APP Line Items'
                : 'Consolidated Purchase Requests'}
              .
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search by name, description, or reference code...`}
              className="pl-8"
              disabled={isLoading}
            />
          </div>

          <div className="border rounded-lg max-h-80 overflow-y-auto">
            {sourceType === 'AppItem' ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12.5"></TableHead>
                    <TableHead>Item Name</TableHead>
                    <TableHead>Office</TableHead>
                    <TableHead className="text-right">Budget (ABC)</TableHead>
                    <TableHead>Mode of Procurement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingAppItems ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground animate-pulse"
                      >
                        Loading Annual Procurement Plan Items...
                      </TableCell>
                    </TableRow>
                  ) : filteredAppItems.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground"
                      >
                        {searchQuery
                          ? 'No approved APP Items found matching your search.'
                          : 'No approved APP Items available. Please ensure APP Items are approved before creating a BAC Resolution.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAppItems.map((item) => {
                      const isSelected = selectedAppItemId === item.id
                      const budget = calculateAppItemBudget(item)
                      return (
                        <TableRow
                          key={item.id}
                          onClick={() => setSelectedAppItemId(item.id)}
                          className={`cursor-pointer hover:bg-default-50 transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                setSelectedAppItemId(item.id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.PPMPItemName ||
                              item.ppmpItem?.name ||
                              item.name ||
                              item.PPMPItem.name ||
                              'Untitled Line Item'}
                          </TableCell>
                          <TableCell>
                            {item.OfficeName || item.office?.name || 'N/A'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₱
                            {budget.toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            {item.ProcurementModeName ||
                              item.ppmpItem?.procurementMode?.name ||
                              'N/A'}
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12.5"></TableHead>
                    <TableHead>CPR Number</TableHead>
                    <TableHead>Description / Purpose</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingConsolidatedPrs ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground animate-pulse"
                      >
                        Loading Consolidated Purchase Requests...
                      </TableCell>
                    </TableRow>
                  ) : filteredConsolidatedPrs.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-6 text-muted-foreground"
                      >
                        No Consolidated PRs found matching search criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredConsolidatedPrs.map((cpr) => {
                      const isSelected = selectedConsolidatedPRId === cpr.id
                      return (
                        <TableRow
                          key={cpr.id}
                          onClick={() => setSelectedConsolidatedPRId(cpr.id)}
                          className={`cursor-pointer hover:bg-default-50 transition-colors ${
                            isSelected ? 'bg-primary/5' : ''
                          }`}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={() =>
                                setSelectedConsolidatedPRId(cpr.id)
                              }
                              onClick={(e) => e.stopPropagation()}
                            />
                          </TableCell>
                          <TableCell className="font-medium">
                            {cpr.cprNumber || cpr.prNumber || 'CPR-N/A'}
                          </TableCell>
                          <TableCell>
                            {cpr.description || cpr.purpose || 'No description'}
                          </TableCell>
                          <TableCell className="text-right font-semibold">
                            ₱
                            {(cpr.totalAmount || 0).toLocaleString('en-PH', {
                              minimumFractionDigits: 2,
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                              {cpr.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-lg font-semibold">
              Verify Selected Source
            </Label>
            <p className="text-sm text-muted-foreground">
              Review parameters extracted from the chosen database record.
            </p>
          </div>

          <div className="rounded-lg border p-6 bg-default-50 space-y-4 shadow-inner">
            {sourceType === 'AppItem' && selectedAppItem ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Source Type
                  </span>
                  <p className="font-semibold text-sm">
                    Annual Procurement Plan (APP) Item
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Project Item Title
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedAppItem?.PPMPItemName ||
                      selectedAppItem?.ppmpItem?.name ||
                      'Untitled Line Item'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Office / Implementing Unit
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedAppItem.office?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Approved Budget (ABC)
                  </span>
                  <p className="font-bold text-sm text-primary">
                    ₱
                    {calculateAppItemBudget(selectedAppItem).toLocaleString(
                      'en-PH',
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Source of Fund
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedAppItem.fundSource?.name || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Mode of Procurement
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedAppItem.ppmpItem?.procurementMode?.name || 'N/A'}
                  </p>
                </div>
              </div>
            ) : sourceType === 'ConsolidatedPR' && selectedConsolidatedPR ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Source Type
                  </span>
                  <p className="font-semibold text-sm">
                    Consolidated Purchase Request (CPR)
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    CPR Number
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedConsolidatedPR.cprNumber ||
                      selectedConsolidatedPR.prNumber ||
                      'CPR-N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Description / Purpose
                  </span>
                  <p className="font-semibold text-sm">
                    {selectedConsolidatedPR.description || 'No description'}
                  </p>
                </div>
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">
                    Total Consolidated Amount
                  </span>
                  <p className="font-bold text-sm text-primary">
                    ₱
                    {(selectedConsolidatedPR.totalAmount || 0).toLocaleString(
                      'en-PH',
                      { minimumFractionDigits: 2 },
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive font-semibold">
                No source item selected correctly.
              </p>
            )}
          </div>
        </div>
      )}

      {step === 4 && (
        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Read Only Source Header Badge */}
          <div className="rounded-md bg-primary/5 border border-primary/20 p-3 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold uppercase text-muted-foreground">
                Selected Source:{' '}
              </span>
              <span className="font-bold text-primary">
                {sourceType === 'AppItem'
                  ? `APP Item: ${selectedAppItem?.ppmpItem?.name}`
                  : `Consolidated PR: ${selectedConsolidatedPR?.cprNumber || selectedConsolidatedPR?.prNumber}`}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="text-primary hover:underline font-semibold"
            >
              Change Source
            </button>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <form.Field name="title">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>Title</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Title of Project"
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

            <form.Field name="abc">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>ABC</Label>
                  <Input
                    id={field.name}
                    type="number"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    placeholder="e.g. 50000"
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
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="e.g. Standard"
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
            <form.Field name="bacResolutionNumber">
              {(field) => (
                <div className="grid gap-2">
                  <Label htmlFor={field.name}>BAC Resolution Number</Label>
                  <Input
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
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
                    onChange={(event) => field.handleChange(event.target.value)}
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
                    <Label htmlFor={field.name}>Resolved Date</Label>
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
                        className="px-3 h-10"
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
                  <Label htmlFor={field.name}>Resolved Location</Label>
                  <Textarea
                    id={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    placeholder="University of Science and Technology of Southern Philippines, Cagayan de Oro City"
                    disabled={isLoading}
                    className="min-h-30"
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

          <div className="space-y-4 rounded-lg border border-default-200 bg-default-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Label className="text-base font-semibold">
                  WHEREAS Clauses
                </Label>
                <p className="text-sm text-muted-foreground">
                  Selected WHEREAS clause templates will appear below. Use
                  Manage WHEREAS to choose saved clause templates or Add Custom
                  Clause to define custom ones.
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
            <p className="text-sm text-muted-foreground">
              Only chosen clauses appear in the selected table.
            </p>
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

      {/* Wizard Step Navigation Footer */}
      <div className="flex justify-between items-center border-t pt-4 mt-6">
        <div>
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePrevStep}
              disabled={isLoading}
              className="flex items-center gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>

          {step < 4 ? (
            <Button
              type="button"
              onClick={handleNextStep}
              disabled={
                isLoading ||
                (step === 2 &&
                  sourceType === 'AppItem' &&
                  !selectedAppItemId) ||
                (step === 2 &&
                  sourceType === 'ConsolidatedPR' &&
                  !selectedConsolidatedPRId)
              }
              className="flex items-center gap-1.5"
            >
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button form={formId} type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Draft'}
            </Button>
          )}
        </div>
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
    </div>
  )
}

