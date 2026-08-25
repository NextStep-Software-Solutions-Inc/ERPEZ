import { useEffect, useMemo, useState, forwardRef, useImperativeHandle } from 'react'
import { useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
  createQueryHookFromTemplate,
  createMutationHookFromTemplate,
} from 'erpez-shared-lib'
import { getWhereasClauseTemplatesRequest } from '../handlers/getWhereasClauseTemplatesRequest'
import { createWhereasClauseTemplateRequest } from '../handlers/createWhereasClauseTemplateRequest'
import { getUsersRequest } from '@/features/planning/market-scoping/handlers/getUsersRequest'
import FieldInfo from '@/components/FieldInfo'
import type { User } from '@/services/api/users'
import type { UpdateBacProjectPayload } from '../handlers/updateBacResolutionRequest'
import type { WhereasClauses } from '../handlers/createBacResolutionRequest'
import { CreateEditWhereasClauseDialog } from '../dialogs/CreateEditWhereasClauseDialog'
import { WhereasClausePickerModal } from '../dialogs/WhereasClausePickerModal'
import { UserPickerCombobox } from './CreateBacResolutionForm'
import { BacResolutionWhereasClause } from '../types'

const useWhereasClauseTemplates = createQueryHookFromTemplate(getWhereasClauseTemplatesRequest)
const useCreateWhereasClauseTemplate = createMutationHookFromTemplate(createWhereasClauseTemplateRequest)
const useUsers = createQueryHookFromTemplate(getUsersRequest)

export const editBacResolutionSchema = z.object({
  title: z.string().min(1, 'Title is required.'),
  abc: z.number().optional(),
  resolutionType: z.string().min(1, 'Resolution type is required.'),
  resolutionNumber: z.string().min(1, 'Resolution number is required.'),
  dateResolved: z.string().min(1, 'Date resolved is required.'),
  resolvedLocation: z.string().optional(),
  whereasClauses: z
    .array(
      z.object({
        whereasClauseId: z.string(),
        order: z.number(),
      }),
    )
    .min(1, 'At least one WHEREAS clause must be selected.'),
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
      onSubmit,
      onDirtyChange,
      isLoading = false,
      formId = 'edit-bac-resolution-form',
    },
    ref,
  ) => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitError, setSubmitError] = useState<string | null>(null)
    const [isWhereasPickerOpen, setIsWhereasPickerOpen] = useState(false)
    const [isCreateWhereasModalOpen, setIsCreateWhereasModalOpen] = useState(false)
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

    const { data: clauseTemplatesData } = useWhereasClauseTemplates({
      pathParams: {},
      queryParams: {}
    })
    const clauseTemplatesMap = useMemo(() => {
      const map = new Map<string, BacResolutionWhereasClause>()
      for (const t of clauseTemplatesData?.data || []) {
        map.set(t.id, t)
      }
      return map
    }, [clauseTemplatesData])

    const { data: usersData, isLoading: isUsersLoading } = useUsers({
      pathParams: {},
      queryParams: {}
    })
    const users: User[] = useMemo(() => usersData?.data || [], [usersData?.data])

    const createClauseMutation = useCreateWhereasClauseTemplate()

    const form = useForm({
      defaultValues: {
        title: initialValues?.title || '',
        abc: initialValues?.abc || 0,
        resolutionType: initialValues?.resolutionType || 'award-recommendation',
        resolutionNumber: initialValues?.resolutionNumber || '',
        dateResolved: initialValues?.dateResolved
          ? new Date(initialValues.dateResolved).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        resolvedLocation: initialValues?.resolvedLocation || '',
        whereasClauses: (initialValues?.whereasClauses || []).map((c, idx) => ({
          whereasClauseId: c.whereasClauseId,
          order: typeof c.order === 'number' ? c.order : idx,
          name: (c as { name?: string }).name,
          body: (c as { body?: string }).body,
        })),
        endUserRepresentativeId: initialValues?.endUserRepresentativeId || '',
        techRepresentativeId: initialValues?.techRepresentativeId || '',
      } as EditBacResolutionFormValues,

      onSubmit: async ({ value }) => {
        setIsSubmitting(true)
        setSubmitError(null)

        try {
          const isoDate = value.dateResolved
            ? new Date(value.dateResolved).toISOString()
            : new Date().toISOString()

          const payload: UpdateBacProjectPayload = {
            title: value.title,
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
        } catch (error) {
          const errMsg =
            error instanceof Error ? error.message : 'Failed to update BAC Resolution'
          setSubmitError(errMsg)
          toast.error(errMsg)
        } finally {
          setIsSubmitting(false)
        }
      },
    })

    // Sync form state when initialValues change dynamically (e.g. after full project details query loads)
    useEffect(() => {
      if (!initialValues) return

      if (initialValues.title !== undefined && initialValues.title !== '') {
        form.setFieldValue('title', initialValues.title)
      }
      if (initialValues.abc !== undefined) {
        form.setFieldValue('abc', initialValues.abc)
      }
      if (initialValues.resolutionNumber !== undefined && initialValues.resolutionNumber !== '') {
        form.setFieldValue('resolutionNumber', initialValues.resolutionNumber)
      }
      if (initialValues.resolutionType !== undefined) {
        form.setFieldValue('resolutionType', initialValues.resolutionType)
      }
      if (initialValues.dateResolved) {
        const isoStr = new Date(initialValues.dateResolved).toISOString().slice(0, 10)
        form.setFieldValue('dateResolved', isoStr)
      }
      if (initialValues.resolvedLocation !== undefined) {
        form.setFieldValue('resolvedLocation', initialValues.resolvedLocation || '')
      }
      if (initialValues.whereasClauses && initialValues.whereasClauses.length > 0) {
        const clauses = initialValues.whereasClauses.map((c, idx) => ({
          whereasClauseId: c.whereasClauseId,
          order: typeof c.order === 'number' ? c.order : idx,
          name: (c as { name?: string }).name,
          body: (c as { body?: string }).body,
        }))
        form.setFieldValue('whereasClauses', clauses)
      }
      if (initialValues.endUserRepresentativeId !== undefined) {
        form.setFieldValue('endUserRepresentativeId', initialValues.endUserRepresentativeId || '')
      }
      if (initialValues.techRepresentativeId !== undefined) {
        form.setFieldValue('techRepresentativeId', initialValues.techRepresentativeId || '')
      }
    }, [initialValues, form])

    useEffect(() => {
      onDirtyChange?.(form.state.isDirty)
    }, [form.state.isDirty, onDirtyChange])

    useImperativeHandle(ref, () => ({
      submit: async () => {
        await form.handleSubmit()
      },
    }))

    // const handleConfirmClauseSelection = (selectedIds: string[]) => {
    //   const currentClauses: WhereasClauses[] = form.getFieldValue('whereasClauses') || []
    //   const currentIds = new Set(currentClauses.map((c) => c.whereasClauseId))

    //   const updated = currentClauses.filter((c) => selectedIds.includes(c.whereasClauseId))

    //   for (const id of selectedIds) {
    //     if (!currentIds.has(id)) {
    //       updated.push({
    //         whereasClauseId: id,
    //         order: updated.length,
    //       })
    //     }
    //   }

    //   const reindexed = updated.map((c, idx) => ({
    //     ...c,
    //     order: idx,
    //   }))

    //   form.setFieldValue('whereasClauses', reindexed)
    // }

    const handleCreateCustomClause = (name: string, body: string) => {
      createClauseMutation.mutate(
        {
          payload: {
            name,
            body
          },
          pathParams: {}
        },
        {
          onSuccess: (res) => {
            const createdId = res.id
            if (createdId) {
              const currentClauses: WhereasClauses[] = form.getFieldValue('whereasClauses') || []
              const updated = [
                ...currentClauses,
                { whereasClauseId: createdId, order: currentClauses.length },
              ]
              form.setFieldValue('whereasClauses', updated)
              toast.success('Custom WHEREAS clause created and added!')
            }
            setIsCreateWhereasModalOpen(false)
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : 'Failed to create clause template')
          },
        },
      )
    }

    return (
      <div className="space-y-6">
        {submitError && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-3.5 text-xs font-medium text-destructive">
            {submitError}
          </div>
        )}

        <form
          id={formId}
          onSubmit={(event) => {
            event.preventDefault()
            event.stopPropagation()
            form.handleSubmit()
          }}
          className="space-y-6"
        >
          {/* Section 1: BAC Resolution Main Information */}
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
                        value={field.state.value || 0}
                        disabled={true}
                        className="bg-default-100 font-semibold cursor-not-allowed text-default-700"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Read-only budget inherited directly from source record.
                      </p>
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

          {/* Section 2: Representatives Section */}
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

          {/* Section 3: WHEREAS Clauses Manager */}
          <div className="rounded-lg border border-default-200 bg-white p-4 space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-default-200 pb-3">
              <div>
                <h4 className="font-bold text-sm text-default-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  WHEREAS Clauses
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Legal clause sequence for this resolution document. Use the Up/Down buttons or drag handles to reorder.
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
                        className="rounded-lg border-2 border-dashed border-default-200 bg-default-50/50 p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                      >
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary mb-2">
                          <Plus className="h-5 w-5" />
                        </div>
                        <p className="font-semibold text-xs text-default-800">
                          No WHEREAS clauses added yet
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Click here to open the selection modal and add legal clause templates to this resolution.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {currentItems.map((item, index) => {
                          const template = clauseTemplatesMap.get(item.whereasClauseId)
                          const clauseName = template?.name || `Clause ${index + 1}`
                          const clauseBody = template?.body || 'Clause body text content...'
                          const isFirst = index === 0
                          const isLast = index === currentItems.length - 1

                          return (
                            <div
                              key={item.whereasClauseId}
                              draggable
                              onDragStart={(e) => handleDragStart(e, index)}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, index)}
                              className={cn(
                                'flex items-start gap-3 rounded-lg border border-default-200 bg-white p-3 shadow-2xs transition-all hover:border-primary/40',
                                draggedIndex === index && 'opacity-50 border-dashed border-primary bg-primary/5',
                              )}
                            >
                              <div className="flex items-center gap-1 self-center text-muted-foreground">
                                <GripVertical className="h-4 w-4 cursor-grab text-default-400 hover:text-default-700" />
                                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                                  {index + 1}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-xs text-default-900 truncate">
                                    {clauseName}
                                  </h5>
                                </div>
                                <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                                  {clauseBody}
                                </p>
                              </div>

                              <div className="flex items-center gap-1 shrink-0 self-center">
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={isFirst}
                                  onClick={() => moveUp(index)}
                                  className="h-7 w-7 text-default-600 hover:text-default-900"
                                  title="Move Up"
                                >
                                  <ChevronUp className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  disabled={isLast}
                                  onClick={() => moveDown(index)}
                                  className="h-7 w-7 text-default-600 hover:text-default-900"
                                  title="Move Down"
                                >
                                  <ChevronDown className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => removeItem(item.whereasClauseId)}
                                  className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                  title="Remove Clause"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                    <FieldInfo field={field} />
                  </div>
                )
              }}
            </form.Field>
          </div>
        </form>

        {/* Modal: Select WHEREAS Clauses */}
        <WhereasClausePickerModal
          open={isWhereasPickerOpen}
          onOpenChange={setIsWhereasPickerOpen}
          templates={clauseTemplatesData?.data || []}
          initialSelected={form.getFieldValue('whereasClauses') || []}
          onApply={(updatedItems) => form.setFieldValue('whereasClauses', updatedItems)}
          onCreateCustom={() => setIsCreateWhereasModalOpen(true)}
        />

        {/* Modal: Create Custom WHEREAS Clause Template */}
        <CreateEditWhereasClauseDialog
          open={isCreateWhereasModalOpen}
          onOpenChange={setIsCreateWhereasModalOpen}
          onSave={handleCreateCustomClause}
          isSubmitting={createClauseMutation.isPending}
        />
      </div>
    )
  },
)

EditBacResolutionForm.displayName = 'EditBacResolutionForm'
