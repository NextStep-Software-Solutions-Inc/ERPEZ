import { useEffect, useMemo, useState } from 'react'
import { Updater, useForm } from '@tanstack/react-form'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { ConfirmAlertDialog } from '@/components/ConfirmAlertDialog'
import type {
  AwardBacResolutionSource,
  CreateNoticeOfAwardPayload,
} from '../types'
import FieldInfo from '@/components/FieldInfo'
import { cn } from '@/lib/utils'
import {
  FileText,
  Tag,
  Info,
  Building2,
  DollarSign,
  FileCode,
  FolderGit2,
  ArrowRight,
} from 'lucide-react'

const createNoticeOfAwardSchema = z.object({
  bacResolutionId: z.string().min(1, 'Approved BAC Resolution is required.'),
  noaNumber: z.string().optional(),
  date: z.string().min(1, 'Date is required.'),
  dateBid: z.string().min(1, 'Date Bid is required.'),
  description: z.string().min(1, 'Description is required.'),
  type: z.enum(['goods-services', 'infrastructure', 'consulting']),
})

export type CreateNoticeOfAwardFormValues = z.infer<
  typeof createNoticeOfAwardSchema
>

type CreateNoticeOfAwardFormProps = {
  availableAwardBacResolutions: AwardBacResolutionSource[]
  isLoading?: boolean
  onSubmit: (values: CreateNoticeOfAwardPayload) => Promise<void> | void
  onCancel: () => void
  onDirtyChange?: (isDirty: boolean) => void
}

export function CreateNoticeOfAwardForm({
  availableAwardBacResolutions,
  isLoading = false,
  onSubmit,
  onCancel,
  onDirtyChange,
}: CreateNoticeOfAwardFormProps) {
  const [showDiscardWarning, setShowDiscardWarning] = useState(false)
  const [selectedBacResolutionId, setSelectedBacResolutionId] = useState('')

  const selectedAwardResolution = useMemo(
    () =>
      availableAwardBacResolutions.find(
        (resolution) => resolution.id === selectedBacResolutionId,
      ) ?? null,
    [availableAwardBacResolutions, selectedBacResolutionId],
  )

  const form = useForm({
    defaultValues: {
      bacResolutionId: '',
      noaNumber: '',
      date: '',
      dateBid: '',
      description: '',
      type: '' as CreateNoticeOfAwardFormValues['type'],
    },
    validators: {
      onChange: createNoticeOfAwardSchema,
    },
    onSubmit: async ({ value }) => {
      const awardResolution = availableAwardBacResolutions.find(
        (resolution) => resolution.id === value.bacResolutionId,
      )

      if (!awardResolution) {
        throw new Error(
          'Select an approved Award Recommendation BAC Resolution.',
        )
      }

      await onSubmit({
        bacResolutionId: awardResolution.id,
        noaNumber: value.noaNumber,
        date: value.date,
        dateBid: value.dateBid,
        description: value.description,
        type: value.type,
      })
      onDirtyChange?.(false)
    },
  })

  useEffect(() => {
    onDirtyChange?.(form.state.isDirty)
  }, [form.state.isDirty, onDirtyChange])

  const requestClose = () => {
    if (form.state.isDirty) {
      setShowDiscardWarning(true)
      return
    }

    onCancel()
  }

  return (
    <>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          event.stopPropagation()
          form.handleSubmit()
        }}
        className="space-y-5"
      >
        <form.Field name="bacResolutionId">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Approved BAC Resolution</Label>
              <Select
                value={field.state.value}
                onValueChange={(value: string | ((prevState: string) => string)) => {
                  field.handleChange(value)
                  setSelectedBacResolutionId(value)
                }}
                disabled={isLoading}
              >
                <SelectTrigger id={field.name}>
                  <SelectValue placeholder="-- Select Approved BAC Resolution --" />
                </SelectTrigger>
                <SelectContent>
                  {availableAwardBacResolutions.map((resolution) => {
                    const projectTitle =
                      resolution.projectName ||
                      resolution.linkedConsolidatedPr?.projectName ||
                      (resolution.description && !resolution.description.startsWith('WHEREAS') ? resolution.description : '')
                    return (
                      <SelectItem key={resolution.id} value={resolution.id}>
                        {resolution.bacResolutionNumber}
                        {projectTitle ? ` — ${projectTitle}` : ''}
                        {resolution.winningSupplierName ? ` (${resolution.winningSupplierName})` : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only approved BAC Resolutions tagged as Award Recommendation are
                available.
              </p>
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-destructive">
                  <FieldInfo field={field} />
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <AwardSourcePreview awardResolution={selectedAwardResolution} />

        <div className="grid gap-4 md:grid-cols-2">
          <form.Field name="noaNumber">
            {(field) => (
              <div className="grid gap-2 md:col-span-1">
                <Label htmlFor={field.name}>NOA Number</Label>
                <Input
                  id={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event: { target: { value: Updater<string> } }) => field.handleChange(event.target.value)}
                  placeholder="NOA-2026-001"
                  disabled={isLoading}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-destructive">
                    <FieldInfo field={field} />
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="date">
            {(field) => (
              <div className="grid gap-2 md:col-span-1">
                <Label htmlFor={field.name}>Date</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event: { target: { value: Updater<string> } }) => field.handleChange(event.target.value)}
                  disabled={isLoading}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-destructive">
                    <FieldInfo field={field} />
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="dateBid">
            {(field) => (
              <div className="grid gap-2 md:col-span-1">
                <Label htmlFor={field.name}>Date Bid</Label>
                <Input
                  id={field.name}
                  type="date"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event: { target: { value: Updater<string> } }) => field.handleChange(event.target.value)}
                  disabled={isLoading}
                />
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-destructive">
                    <FieldInfo field={field} />
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>

          <form.Field name="type">
            {(field) => (
              <div className="grid gap-2 md:col-span-1">
                <Label htmlFor={field.name}>Procurement Type</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(value: string) =>
                    field.handleChange(
                      value as CreateNoticeOfAwardFormValues['type'],
                    )
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id={field.name}>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="goods-services">
                      Goods and Services
                    </SelectItem>
                    <SelectItem value="infrastructure">
                      Infrastructure
                    </SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                  </SelectContent>
                </Select>
                {field.state.meta.errors.length > 0 ? (
                  <p className="text-sm text-destructive">
                    <FieldInfo field={field} />
                  </p>
                ) : null}
              </div>
            )}
          </form.Field>
        </div>

        <form.Field name="description">
          {(field) => (
            <div className="grid gap-2">
              <Label htmlFor={field.name}>Description</Label>
              <Textarea
                id={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event: { target: { value: Updater<string> } }) => field.handleChange(event.target.value)}
                placeholder="Describe the award and routing basis"
                disabled={isLoading}
              />
              {field.state.meta.errors.length > 0 ? (
                <p className="text-sm text-destructive">
                  <FieldInfo field={field} />
                </p>
              ) : null}
            </div>
          )}
        </form.Field>

        <div className="flex justify-end gap-2 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={requestClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || form.state.isSubmitting}>
            {isLoading ? 'Creating...' : 'Create Draft'}
          </Button>
        </div>
      </form>

      <ConfirmAlertDialog
        open={showDiscardWarning}
        onOpenChange={setShowDiscardWarning}
        title="Discard draft?"
        description="You have unsaved NOA draft data. Do you want to discard it?"
        confirmLabel="Discard"
        cancelLabel="Keep Editing"
        onConfirm={() => {
          setShowDiscardWarning(false)
          onDirtyChange?.(false)
          onCancel()
        }}
      />
    </>
  )
}

function AwardSourcePreview({
  awardResolution,
}: {
  awardResolution: AwardBacResolutionSource | null
}) {
  if (!awardResolution) {
    return (
      <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/20 p-5 text-sm text-blue-700 flex items-center gap-3 shadow-xs">
        <Info className="h-5 w-5 text-blue-500 shrink-0 animate-pulse" />
        <div>
          <p className="font-semibold text-blue-900">No Resolution Selected</p>
          <p className="text-xs text-blue-600 mt-0.5">Select an approved BAC Resolution above to load and preview supplier, amount, and PR data.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/10 via-background to-background p-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-default-150 pb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
          <FileText className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-sm font-semibold text-default-900">Selected Resolution Details</h4>
          <p className="text-xs text-default-500">Auto-filled source information</p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ReadOnlyValue
          label="BAC Resolution No."
          value={awardResolution.bacResolutionNumber}
          icon={FileCode}
          variant="info"
        />
        <ReadOnlyValue
          label="Source AOB"
          value={awardResolution.sourceAobNumber ?? '-'}
          icon={Tag}
        />
        <ReadOnlyValue
          label="Source Module"
          value={
            awardResolution.sourceModule === 'bid-evaluation'
              ? 'Bid Evaluation winner'
              : 'BAC Resolution'
          }
          icon={Info}
        />
        <ReadOnlyValue
          label="Winning Supplier"
          value={awardResolution.winningSupplierName}
          icon={Building2}
          variant="success"
        />
        <ReadOnlyValue
          label="Awarded Amount"
          value={`₱ ${awardResolution.awardedAmount.toLocaleString('en-PH', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          icon={DollarSign}
          variant="success"
        />
        <ReadOnlyValue
          label="Purchase Request (PR)"
          value={awardResolution.linkedConsolidatedPr.prNumber}
          icon={FileText}
        />
        <ReadOnlyValue
          label="Project"
          value={awardResolution.linkedConsolidatedPr.projectName}
          icon={FolderGit2}
          className="md:col-span-2"
        />
      </div>

      <div className="rounded-xl border border-default-200 bg-background overflow-hidden shadow-xs">
        <div className="border-b border-default-150 bg-default-50/50 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-default-500">
            Inherited PR Items
          </span>
          <span className="text-[11px] font-semibold text-default-400">
            Showing {Math.min(4, awardResolution.lineItems.length)} of {awardResolution.lineItems.length} items
          </span>
        </div>
        <div className="divide-y divide-default-100">
          {awardResolution.lineItems.slice(0, 4).map((lineItem) => (
            <div
              key={lineItem.id}
              className="grid gap-2 px-4 py-3.5 text-sm md:grid-cols-[1fr_auto] hover:bg-default-50/30 transition-colors"
            >
              <div>
                <div className="font-semibold text-default-900">
                  {lineItem.itemName}
                </div>
                <div className="text-xs text-default-500 mt-0.5">
                  {lineItem.category} &bull; <span className="font-semibold text-default-600">{lineItem.quantity} {lineItem.unit}</span>
                </div>
              </div>
              <div className="font-bold text-default-900 self-center">
                ₱ {lineItem.amount.toLocaleString('en-PH', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function ReadOnlyValue({
  label,
  value,
  icon: Icon,
  variant = 'default',
  className,
}: {
  label: string
  value: string
  icon?: any
  variant?: 'default' | 'success' | 'info' | 'warning'
  className?: string
}) {
  const variantClasses = {
    default: 'bg-background border-default-200/60 text-default-900',
    success: 'bg-emerald-50/30 border-emerald-100/80 text-emerald-950',
    info: 'bg-blue-50/30 border-blue-100/80 text-blue-950',
    warning: 'bg-amber-50/30 border-amber-100/80 text-amber-950',
  }

  const iconColor = {
    default: 'text-default-400',
    success: 'text-emerald-500',
    info: 'text-blue-500',
    warning: 'text-amber-500',
  }

  return (
    <div
      className={cn(
        'rounded-xl border p-3 flex items-start gap-3 shadow-2xs',
        variantClasses[variant],
        className,
      )}
    >
      {Icon && (
        <div className={cn('mt-0.5 shrink-0', iconColor[variant])}>
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="text-[10px] font-bold uppercase tracking-wider text-default-450">
          {label}
        </div>
        <div className="mt-1 text-sm font-semibold leading-snug break-words">
          {value}
        </div>
      </div>
    </div>
  )
}
