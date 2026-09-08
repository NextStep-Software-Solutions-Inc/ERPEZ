import {
  useEffect,
  useMemo,
  useState,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  AlertTriangle,
  Check,
  PackageCheck,
  Layers,
  FileSpreadsheet,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getResolutionClausesRequest } from '../handlers/getResolutionClausesRequest'
import { createResolutionClauseRequest } from '../handlers/createResolutionClauseRequest'
import { getUsersRequest } from '@/features/planning/market-scoping/handlers/getUsersRequest'
import FieldInfo from '@/components/FieldInfo'
import type { User } from '@/services/api/users'
import type { UpdateBacProjectPayload } from '../handlers/updateBacResolutionRequest'
import type {
  AppItemLinkItem,
  BacProjectDetails,
  ResolutionClause,
  ResolutionClauseType,
} from '../types'
import { CreateEditResolutionClauseDialog } from '../dialogs/CreateEditResolutionClauseDialog'
import {
  ResolutionClausePickerModal,
  normalizeClauseType,
} from '../dialogs/ResolutionClausePickerModal'
import { UserPickerCombobox } from './CreateBacResolutionForm'

const useResolutionClauses = createQueryHookFromTemplate(
  getResolutionClausesRequest,
)
const useCreateResolutionClause = createMutationHookFromTemplate(
  createResolutionClauseRequest,
)
const useUsers = createQueryHookFromTemplate(getUsersRequest)

export const editBacResolutionSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  abc: z.number().optional(),
  resolutionType: z.string().min(1, 'Resolution type is required.'),
  resolutionNumber: z.string().min(1, 'Resolution number is required.'),
  dateResolved: z.string().min(1, 'Date resolved is required.'),
  resolvedLocation: z.string().optional(),
  endUserRepresentativeId: z.string().optional(),
  techRepresentativeId: z.string().optional(),
})

export type EditBacResolutionFormValues = z.infer<
  typeof editBacResolutionSchema
>

export interface EditBacResolutionFormRef {
  submit: () => Promise<void>
}

interface EditBacResolutionFormProps {
  initialValues?: Partial<UpdateBacProjectPayload & { abc?: number }>
  projectDetails?: BacProjectDetails
  onSubmit: (values: UpdateBacProjectPayload) => Promise<void> | void
  onCancel?: () => void
  onDirtyChange?: (isDirty: boolean) => void
  isLoading?: boolean
  formId?: string
}

export const EditBacResolutionForm = forwardRef<
  EditBacResolutionFormRef,
  EditBacResolutionFormProps
>(
  (
    {
      initialValues,
      projectDetails,
      onSubmit,
      onDirtyChange,
      isLoading = false,
      formId = 'edit-bac-resolution-form',
    },
    ref,
  ) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)

    // Clause state:
    const [whereasClauses, setWhereasClauses] = useState<
      { resolutionClauseId: string; order: number }[]
    >([])
    const [nowThereforeClauses, setNowThereforeClauses] = useState<
      { resolutionClauseId: string; order: number }[]
    >([])
    const [resolvedClauses, setResolvedClauses] = useState<
      { resolutionClauseId: string; order: number }[]
    >([])

    // Locally created custom clauses for instant preview
    const [createdClauses, setCreatedClauses] = useState<ResolutionClause[]>([])

    // Stable references to prevent stale closures
    const whereasClausesRef = useRef(whereasClauses)
    whereasClausesRef.current = whereasClauses

    const nowThereforeClausesRef = useRef(nowThereforeClauses)
    nowThereforeClausesRef.current = nowThereforeClauses

    const resolvedClausesRef = useRef(resolvedClauses)
    resolvedClausesRef.current = resolvedClauses

    // Modal state:
    const [pickerModalType, setPickerModalType] =
      useState<ResolutionClauseType | null>(null)
    const [createModalType, setCreateModalType] =
      useState<ResolutionClauseType | null>(null)

    // Collapsible sections:
    const [isWhereasExpanded, setIsWhereasExpanded] = useState(true)
    const [isNowThereforeExpanded, setIsNowThereforeExpanded] = useState(false)
    const [isResolvedExpanded, setIsResolvedExpanded] = useState(false)
    const [showClauseErrors, setShowClauseErrors] = useState(false)

    // Load clauses for picker
    const { data: resolutionClausesData, isPending: isClausesPending } =
      useResolutionClauses({
        pathParams: {},
        queryParams: { pageSize: 200, filters: pickerModalType || undefined },
        enabled: pickerModalType !== null,
      })

    // Load all clauses for lookup
    const { data: allClausesData } = useResolutionClauses({
      pathParams: {},
      queryParams: { pageSize: 500 },
    })

    const allClausesMap = useMemo(() => {
      const map = new Map<string, ResolutionClause>()
      const list = Array.isArray(allClausesData?.data)
        ? allClausesData.data
        : Array.isArray(allClausesData)
          ? allClausesData
          : []
      for (const item of list) {
        map.set(item.id, item)
      }
      for (const item of createdClauses) {
        map.set(item.id, item)
      }
      return map
    }, [allClausesData, createdClauses])

    const clauseTemplates = useMemo<ResolutionClause[]>(() => {
      const map = new Map<string, ResolutionClause>()
      const addItems = (data: unknown) => {
        if (!data) return
        const list = Array.isArray((data as { data?: unknown })?.data)
          ? (data as { data: ResolutionClause[] }).data
          : Array.isArray(data)
            ? (data as ResolutionClause[])
            : []
        for (const item of list) {
          if (item?.id) {
            map.set(item.id, item)
          }
        }
      }

      addItems(allClausesData)
      addItems(resolutionClausesData)
      for (const item of createdClauses) {
        map.set(item.id, item)
      }

      const allList = Array.from(map.values())
      if (!pickerModalType) return allList

      const targetType = normalizeClauseType(pickerModalType)
      return allList.filter(
        (c) => normalizeClauseType(c.clauseType) === targetType,
      )
    }, [allClausesData, resolutionClausesData, createdClauses, pickerModalType])

    // Populate initial clauses
    useEffect(() => {
      if (initialValues?.whereasClauseLinks?.length) {
        setWhereasClauses(initialValues.whereasClauseLinks)
      } else if (initialValues?.whereasClauses?.length) {
        setWhereasClauses(
          initialValues.whereasClauses.map((c, idx) => ({
            resolutionClauseId: c.whereasClauseId,
            order: typeof c.order === 'number' ? c.order : idx,
          })),
        )
      }

      if (initialValues?.nowThereforeClauses?.length) {
        setNowThereforeClauses(initialValues.nowThereforeClauses)
      }

      if (initialValues?.resolvedClauses?.length) {
        setResolvedClauses(initialValues.resolvedClauses)
      }
    }, [initialValues])

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

    const createClauseMutation = useCreateResolutionClause()

    const handleCreateCustomClause = async (
      name: string,
      body: string,
      type: ResolutionClauseType,
    ) => {
      const created = await createClauseMutation.mutateAsync({
        pathParams: {},
        payload: { name, body, clauseType: type },
      })

      setCreatedClauses((prev) => [...prev, created])

      if (type === 'Whereas') {
        setWhereasClauses((prev) => [
          ...prev,
          { resolutionClauseId: created.id, order: prev.length },
        ])
      } else if (type === 'NowTherefore') {
        setNowThereforeClauses((prev) => [
          ...prev,
          { resolutionClauseId: created.id, order: prev.length },
        ])
      } else if (type === 'Resolved') {
        setResolvedClauses((prev) => [
          ...prev,
          { resolutionClauseId: created.id, order: prev.length },
        ])
      }

      toast.success(`Custom ${type} Clause created and added.`)
    }

    const form = useForm({
      defaultValues: {
        title: initialValues?.title || '',
        abc: initialValues?.abc || 0,
        resolutionType: initialValues?.resolutionType || 'award-recommendation',
        resolutionNumber: initialValues?.resolutionNumber || '',
        dateResolved: initialValues?.dateResolved
          ? initialValues.dateResolved.split('T')[0]
          : '',
        resolvedLocation: initialValues?.resolvedLocation || '',
        endUserRepresentativeId:
          initialValues?.endUserRepresentativeId || undefined,
        techRepresentativeId: initialValues?.techRepresentativeId || undefined,
      },
      onSubmit: async ({ value }) => {
        setIsSubmitting(true)
        setSubmitError(null)

        const currentWhereas = whereasClausesRef.current
        const currentNowTherefore = nowThereforeClausesRef.current
        const currentResolved = resolvedClausesRef.current

        const missingWhereas = currentWhereas.length === 0
        const missingNowTherefore = currentNowTherefore.length === 0
        const missingResolved = currentResolved.length === 0

        if (missingWhereas || missingNowTherefore || missingResolved) {
          setShowClauseErrors(true)
          if (missingWhereas) setIsWhereasExpanded(true)
          if (missingNowTherefore) setIsNowThereforeExpanded(true)
          if (missingResolved) setIsResolvedExpanded(true)
          setIsSubmitting(false)

          const missingParts: string[] = []
          if (missingWhereas) missingParts.push('WHEREAS')
          if (missingNowTherefore) missingParts.push('NOW, THEREFORE')
          if (missingResolved) missingParts.push('RESOLVED')
          toast.error(
            `Please add at least one clause for: ${missingParts.join(', ')}.`,
          )
          return
        }

        try {
          const payload: UpdateBacProjectPayload = {
            title: value.title,
            resolutionType: value.resolutionType,
            resolutionNumber: value.resolutionNumber,
            dateResolved: value.dateResolved,
            resolvedLocation: value.resolvedLocation,
            whereasClauseLinks: currentWhereas.map((c, idx) => ({
              resolutionClauseId: c.resolutionClauseId,
              order: idx,
            })),
            nowThereforeClauses: currentNowTherefore.map((c, idx) => ({
              resolutionClauseId: c.resolutionClauseId,
              order: idx,
            })),
            resolvedClauses: currentResolved.map((c, idx) => ({
              resolutionClauseId: c.resolutionClauseId,
              order: idx,
            })),
            endUserRepresentativeId: value.endUserRepresentativeId,
            techRepresentativeId: value.techRepresentativeId,
          }

          await onSubmit(payload)
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : 'Failed to update BAC Resolution'
          setSubmitError(msg)
          toast.error(msg)
        } finally {
          setIsSubmitting(false)
        }
      },
    })

    useEffect(() => {
      onDirtyChange?.(form.state.isDirty)
    }, [form.state.isDirty, onDirtyChange])

    const handleSubmit = async () => {
      setSubmitError(null)

      const currentWhereas = whereasClausesRef.current
      const currentNowTherefore = nowThereforeClausesRef.current
      const currentResolved = resolvedClausesRef.current

      const missingWhereas = currentWhereas.length === 0
      const missingNowTherefore = currentNowTherefore.length === 0
      const missingResolved = currentResolved.length === 0

      if (missingWhereas || missingNowTherefore || missingResolved) {
        setShowClauseErrors(true)
        if (missingWhereas) setIsWhereasExpanded(true)
        if (missingNowTherefore) setIsNowThereforeExpanded(true)
        if (missingResolved) setIsResolvedExpanded(true)

        const missingParts: string[] = []
        if (missingWhereas) missingParts.push('WHEREAS')
        if (missingNowTherefore) missingParts.push('NOW, THEREFORE')
        if (missingResolved) missingParts.push('RESOLVED')
        toast.error(
          `Please add at least one clause for: ${missingParts.join(', ')}.`,
        )
        return
      }

      await form.handleSubmit()
    }

    useImperativeHandle(
      ref,
      () => ({
        submit: handleSubmit,
      }),
      [whereasClauses, nowThereforeClauses, resolvedClauses],
    )

    const appItemLinks: AppItemLinkItem[] = projectDetails?.appItemLinks || []

    return (
      <form
        id={formId}
        onSubmit={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleSubmit()
        }}
        className="space-y-6"
      >
        {submitError && (
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <p className="font-semibold">Update Error</p>
            <p className="text-xs mt-1">{submitError}</p>
          </div>
        )}

        {/* Read-Only Linked APP Items Table (if present) */}
        {appItemLinks.length > 0 && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-primary" />
                <h4 className="font-bold text-sm text-default-900">
                  Linked APP Items ({appItemLinks.length})
                </h4>
                {appItemLinks[0]?.appNumber && (
                  <Badge
                    variant="outline"
                    className="bg-white text-primary border-primary/30 text-xs"
                  >
                    {appItemLinks[0].appNumber}
                  </Badge>
                )}
              </div>
              <span className="text-xs font-semibold text-muted-foreground">
                Parent APP:{' '}
                <span className="text-default-900">
                  {appItemLinks[0]?.appName || 'Annual Procurement Plan'}
                </span>
              </span>
            </div>

            <div className="overflow-hidden rounded-md border border-default-200 bg-white">
              <Table>
                <TableHeader className="bg-default-50">
                  <TableRow>
                    <TableHead className="w-[100px] text-xs font-bold">
                      Item #
                    </TableHead>
                    <TableHead className="text-xs font-bold">
                      Description / Line Item
                    </TableHead>
                    <TableHead className="text-xs font-bold">Office</TableHead>
                    <TableHead className="text-right text-xs font-bold">
                      Approved Budget (ABC)
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {appItemLinks.map((item, idx) => (
                    <TableRow
                      key={item.id || item.appItemId}
                      className="text-xs"
                    >
                      <TableCell className="font-semibold text-primary">
                        {item.itemNumber ||
                          `Item ${(idx + 1).toString().padStart(2, '0')}`}
                      </TableCell>
                      <TableCell className="font-medium text-default-900 max-w-[280px]">
                        <p className="truncate font-semibold">
                          {item.description}
                        </p>
                      </TableCell>
                      <TableCell className="text-default-700">
                        {item.officeName || '—'}
                      </TableCell>
                      <TableCell className="text-right font-semibold text-emerald-700">
                        ₱
                        {item.effectiveABC.toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                        })}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-default-50/80 font-bold border-t-2 border-default-300">
                    <TableCell
                      colSpan={3}
                      className="text-right text-xs uppercase tracking-wider text-default-800"
                    >
                      Total Approved Budget for Contract (ABC):
                    </TableCell>
                    <TableCell className="text-right text-sm font-bold text-emerald-700">
                      ₱
                      {appItemLinks
                        .reduce((s, i) => s + i.effectiveABC, 0)
                        .toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* CPR Details (if CPR source) */}
        {projectDetails?.consolidatedPR && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 space-y-2 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="h-4 w-4 text-emerald-700" />
                <h4 className="font-bold text-sm text-default-900">
                  Linked Consolidated Purchase Request
                </h4>
              </div>
              <Badge
                variant="outline"
                className="bg-white text-emerald-800 border-emerald-300 font-semibold"
              >
                {projectDetails.consolidatedPR.prNumber}
              </Badge>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <div>
                <span className="text-muted-foreground">Project:</span>
                <p className="font-semibold text-default-900 truncate">
                  {projectDetails.consolidatedPR.description}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">End-User:</span>
                <p className="font-semibold text-default-900">
                  {projectDetails.consolidatedPR.endUser || '—'}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Total Budget:</span>
                <p className="font-bold text-emerald-700">
                  ₱
                  {(
                    projectDetails.consolidatedPR.totalAmount || 0
                  ).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General Project Metadata */}
        <div className="rounded-lg border border-default-200 bg-white p-4 space-y-5 shadow-xs">
          <h4 className="font-bold text-sm text-default-900 border-b border-default-200 pb-2">
            Project & Resolution Details
          </h4>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="md:col-span-2">
              <form.Field name="title">
                {(field) => (
                  <div className="grid gap-2">
                    <Label htmlFor={field.name}>Project Title *</Label>
                    <Input
                      id={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Procurement Project Title"
                      disabled={isLoading || isSubmitting}
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
                    <Label htmlFor={field.name}>Approved Budget (ABC)</Label>
                    <Input
                      id={field.name}
                      type="number"
                      step="0.01"
                      value={field.state.value}
                      disabled={true}
                      className="bg-default-100 font-semibold cursor-not-allowed text-default-700"
                    />
                    <FieldInfo field={field} />
                  </div>
                )}
              </form.Field>
            </div>
          </div>

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

        {/* THREE COLLAPSIBLE CLAUSE SECTIONS */}
        <div className="space-y-4">
          <EditClauseSection
            title="WHEREAS Clauses"
            description="Legal context and background clauses for this resolution."
            badgeRequired={true}
            items={whereasClauses}
            clausesMap={allClausesMap}
            isExpanded={isWhereasExpanded}
            onToggleExpand={() => setIsWhereasExpanded((prev) => !prev)}
            onOpenPicker={() => setPickerModalType('Whereas')}
            onOpenCreate={() => setCreateModalType('Whereas')}
            onChangeItems={setWhereasClauses}
            errorMessage={
              showClauseErrors && whereasClauses.length === 0
                ? 'At least one WHEREAS clause is required.'
                : null
            }
          />

          <EditClauseSection
            title="NOW, THEREFORE Clauses"
            description="Committee premise and transition clauses."
            badgeRequired={true}
            items={nowThereforeClauses}
            clausesMap={allClausesMap}
            isExpanded={isNowThereforeExpanded}
            onToggleExpand={() => setIsNowThereforeExpanded((prev) => !prev)}
            onOpenPicker={() => setPickerModalType('NowTherefore')}
            onOpenCreate={() => setCreateModalType('NowTherefore')}
            onChangeItems={setNowThereforeClauses}
            errorMessage={
              showClauseErrors && nowThereforeClauses.length === 0
                ? 'At least one NOW, THEREFORE clause is required.'
                : null
            }
          />

          <EditClauseSection
            title="RESOLVED Clauses"
            description="Final resolution decisions and award recommendations."
            badgeRequired={true}
            items={resolvedClauses}
            clausesMap={allClausesMap}
            isExpanded={isResolvedExpanded}
            onToggleExpand={() => setIsResolvedExpanded((prev) => !prev)}
            onOpenPicker={() => setPickerModalType('Resolved')}
            onOpenCreate={() => setCreateModalType('Resolved')}
            onChangeItems={setResolvedClauses}
            errorMessage={
              showClauseErrors && resolvedClauses.length === 0
                ? 'At least one RESOLVED clause is required.'
                : null
            }
          />
        </div>

        {/* Modal: Clause Picker */}
        {pickerModalType && (
          <ResolutionClausePickerModal
            open={pickerModalType !== null}
            onOpenChange={(open) => {
              if (!open) setPickerModalType(null)
            }}
            clauseType={pickerModalType}
            templates={clauseTemplates}
            initialSelected={
              pickerModalType === 'Whereas'
                ? whereasClauses
                : pickerModalType === 'NowTherefore'
                  ? nowThereforeClauses
                  : resolvedClauses
            }
            onApply={(selected) => {
              if (pickerModalType === 'Whereas') {
                setWhereasClauses(selected)
              } else if (pickerModalType === 'NowTherefore') {
                setNowThereforeClauses(selected)
              } else if (pickerModalType === 'Resolved') {
                setResolvedClauses(selected)
              }
              setPickerModalType(null)
            }}
            onCreateCustom={() => {
              const currentType = pickerModalType
              setPickerModalType(null)
              setCreateModalType(currentType)
            }}
            isPending={isClausesPending}
          />
        )}

        {/* Modal: Create Custom Clause */}
        {createModalType && (
          <CreateEditResolutionClauseDialog
            open={createModalType !== null}
            onOpenChange={(open) => {
              if (!open) setCreateModalType(null)
            }}
            defaultClauseType={createModalType}
            onSave={async (name, body, type) => {
              await handleCreateCustomClause(name, body, type)
            }}
            isSubmitting={createClauseMutation.isPending}
          />
        )}
      </form>
    )
  },
)

EditBacResolutionForm.displayName = 'EditBacResolutionForm'

/* ── HELPER: EDIT CLAUSE SECTION ─────────────────────────────────────────── */
interface EditClauseSectionProps {
  title: string
  description: string
  badgeRequired: boolean
  items: { resolutionClauseId: string; order: number }[]
  clausesMap: Map<string, ResolutionClause>
  isExpanded: boolean
  onToggleExpand: () => void
  onOpenPicker: () => void
  onOpenCreate: () => void
  onChangeItems: (
    items: { resolutionClauseId: string; order: number }[],
  ) => void
  errorMessage?: string | null
}

function EditClauseSection({
  title,
  description,
  badgeRequired,
  items,
  clausesMap,
  isExpanded,
  onToggleExpand,
  onOpenPicker,
  onOpenCreate,
  onChangeItems,
  errorMessage,
}: EditClauseSectionProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const removeItem = (id: string) => {
    const next = items
      .filter((c) => c.resolutionClauseId !== id)
      .map((c, idx) => ({
        resolutionClauseId: c.resolutionClauseId,
        order: idx,
      }))
    onChangeItems(next)
  }

  const moveUp = (index: number) => {
    if (index <= 0) return
    const newArr = [...items]
    const temp = newArr[index - 1]
    newArr[index - 1] = newArr[index]
    newArr[index] = temp
    onChangeItems(newArr.map((item, idx) => ({ ...item, order: idx })))
  }

  const moveDown = (index: number) => {
    if (index >= items.length - 1) return
    const newArr = [...items]
    const temp = newArr[index + 1]
    newArr[index + 1] = newArr[index]
    newArr[index] = temp
    onChangeItems(newArr.map((item, idx) => ({ ...item, order: idx })))
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
    const sourceIndex = sourceIndexStr
      ? parseInt(sourceIndexStr, 10)
      : draggedIndex
    if (
      sourceIndex === null ||
      sourceIndex === undefined ||
      isNaN(sourceIndex) ||
      sourceIndex === targetIndex
    ) {
      setDraggedIndex(null)
      return
    }

    const updated = [...items]
    const [removed] = updated.splice(sourceIndex, 1)
    updated.splice(targetIndex, 0, removed)
    onChangeItems(updated.map((item, idx) => ({ ...item, order: idx })))
    setDraggedIndex(null)
  }

  return (
    <div
      className={cn(
        'rounded-lg border bg-white overflow-hidden shadow-xs transition-colors',
        errorMessage
          ? 'border-destructive/50 ring-1 ring-destructive/20'
          : 'border-default-200',
      )}
    >
      <div
        onClick={onToggleExpand}
        className="p-3.5 bg-default-50/70 flex items-center justify-between cursor-pointer select-none hover:bg-default-100/70 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-sm text-default-900">{title}</h4>
          {badgeRequired ? (
            items.length >= 1 ? (
              <Badge
                variant="outline"
                className="bg-emerald-50 text-emerald-700 border-emerald-300 text-[10px] font-semibold flex items-center gap-1"
              >
                <Check className="h-2.5 w-2.5" /> Satisfied
              </Badge>
            ) : errorMessage ? (
              <Badge
                variant="outline"
                className="bg-destructive/10 text-destructive border-destructive/20 text-[10px] font-semibold"
              >
                Required (≥1)
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-amber-50 text-amber-700 border-amber-300 text-[10px] font-semibold"
              >
                Required (≥1)
              </Badge>
            )
          ) : (
            <Badge
              variant="secondary"
              className="text-[10px] text-muted-foreground"
            >
              Optional
            </Badge>
          )}
          <Badge variant="secondary" className="text-[10px] font-bold">
            {items.length} selected
          </Badge>
        </div>

        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenCreate}
            className="h-7 text-xs gap-1 text-default-700 border-default-300 hover:bg-default-100"
          >
            <Plus className="h-3 w-3" /> Custom
          </Button>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={onOpenPicker}
            className="h-7 text-xs font-semibold gap-1"
          >
            <FileText className="h-3 w-3" /> Add from Library
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onToggleExpand}
            className="h-7 w-7 text-muted-foreground"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="mx-3.5 my-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 flex items-center gap-2 text-xs text-destructive font-medium shadow-2xs">
          <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
          <span>{errorMessage}</span>
        </div>
      )}

      {isExpanded && (
        <div className="p-4 space-y-3 border-t border-default-200">
          <p className="text-xs text-muted-foreground">{description}</p>

          {items.length === 0 ? (
            <div className="rounded-lg border border-dashed border-default-200 bg-default-50/50 p-6 text-center text-xs text-muted-foreground">
              No clauses added yet. Click &quot;Add from Library&quot; or
              &quot;Custom&quot; to add clauses.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item, index) => {
                const clauseObj = clausesMap.get(item.resolutionClauseId)
                return (
                  <div
                    key={item.resolutionClauseId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={cn(
                      'group flex items-start gap-3 p-3 rounded-lg border bg-white shadow-xs transition-all',
                      draggedIndex === index
                        ? 'opacity-40 border-primary border-dashed'
                        : 'border-default-200 hover:border-default-300',
                    )}
                  >
                    <div className="cursor-grab active:cursor-grabbing text-muted-foreground group-hover:text-default-700 flex items-center justify-center h-6 w-4 mt-0.5">
                      <GripVertical className="h-4 w-4" />
                    </div>

                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary mt-0.5">
                      {index + 1}
                    </span>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-xs text-default-900">
                          {clauseObj?.name || 'Clause'}
                        </span>
                        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === 0}
                            onClick={() => moveUp(index)}
                            className="h-6 w-6 text-muted-foreground hover:text-default-900"
                          >
                            <ChevronUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            disabled={index === items.length - 1}
                            onClick={() => moveDown(index)}
                            className="h-6 w-6 text-muted-foreground hover:text-default-900"
                          >
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeItem(item.resolutionClauseId)}
                            className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                        {clauseObj?.body || ''}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
