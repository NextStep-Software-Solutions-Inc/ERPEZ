/**
 * ScheduleMatrixRow
 * A single table row for a PPMP line item showing the Jan–Dec inline editing matrix.
 * Inline cell editing: click → type → blur saves. Real-time budget recomputation.
 */

import { useState, useCallback, useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { toast } from 'sonner'
import {
  MoreVertical,
  Pencil,
  Trash2,
  Link2,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type {
  PPMPAttachment,
  PPMPLineItem,
  Month,
  PreProcurementConferenceValue,
  UpdateLineItemMetadataPayload,
} from '../types'
import { ALL_MONTHS, MONTH_LABELS } from '../types'
import {
  displayNaValue,
  displayPreProcurementConference,
  PPMP_FIELD_LABELS,
} from '../lib/ppmpFieldDefaults'
import { formatCurrency } from '../lib/ppmpUtils'
import { isValidExpectedDeliveryPeriod } from '../lib/ppmpProcurementMetadata'
import {
  mopOverrideDialogOpenAtom,
  targetLineItemIdForMopAtom,
  linkScopingFormModalOpenAtom,
  targetLineItemIdForMsfAtom,
  selectedPpmpForEditAtom,
} from '../atoms'
import {
  updateLineItemAttachmentsRequest,
  updateLineItemMetadataRequest,
} from '../handlers'
import { SupportingDocumentsCell } from './SupportingDocumentsCell'
import { MonthYearPicker } from './MonthYearPicker'
import { TruncatedRemarkPopover } from './TruncatedRemarkPopover'

interface ScheduleMatrixRowProps {
  item: PPMPLineItem
  ppmpId: string
  activityName?: string
  onScheduleChange: (itemId: string, month: Month, value: number) => void
  onDelete: (itemId: string) => void
  isDeleting?: boolean
  isReadOnly?: boolean
  isSelected?: boolean
  onSelectChange?: (itemId: string, checked: boolean) => void
}

type MetadataField =
  | 'sizeSpecification'
  | 'expectedDelivery'
  | 'procurementStart'
  | 'procurementEnd'

type ProjectTypeSelectValue = ProjectType | 'unset'
type PreProcSelectValue = PreProcurementConferenceValue

interface MetadataDraft {
  projectType: ProjectTypeSelectValue
  sizeSpecification: string
  preProcurementConference: PreProcSelectValue
  procurementStart: string
  procurementEnd: string
  expectedDelivery: string
}

function getProjectTypeSelectValue(
  projectType: PPMPLineItem['projectType'],
): ProjectTypeSelectValue {
  return projectType ?? 'unset'
}

function getPreProcurementSelectValue(
  value: PPMPLineItem['preProcurementConference'] | boolean | null | undefined,
): PreProcSelectValue {
  if (value === true) return 'yes'
  if (value === false) return 'no'
  return value ?? 'N/A'
}

function buildMetadataDraft(item: PPMPLineItem): MetadataDraft {
  return {
    projectType: getProjectTypeSelectValue(item.projectType),
    sizeSpecification: item.sizeSpecification ?? '',
    preProcurementConference: getPreProcurementSelectValue(
      item.preProcurementConference,
    ),
    procurementStart: item.procurementStart ?? '',
    procurementEnd: item.procurementEnd ?? '',
    expectedDelivery: item.expectedDelivery ?? '',
  }
}

export function ScheduleMatrixRow({
  item,
  ppmpId,
  activityName,
  onScheduleChange,
  onDelete,
  isDeleting = false,
  isReadOnly = false,
  isSelected = false,
  onSelectChange,
}: ScheduleMatrixRowProps) {
  const [editingCell, setEditingCell] = useState<Month | null>(null)
  const [cellErrors, setCellErrors] = useState<Partial<Record<Month, string>>>(
    {},
  )
  const [metadataDraft, setMetadataDraft] = useState<MetadataDraft>(() =>
    buildMetadataDraft(item),
  )
  const [metadataErrors, setMetadataErrors] = useState<
    Partial<Record<MetadataField, string>>
  >({})
  const [remarksPopoverOpen, setRemarksPopoverOpen] = useState(false)
  const [remarksDraft, setRemarksDraft] = useState(item.remarks ?? '')
  const [isSavingMetadata, setIsSavingMetadata] = useState(false)
  const [isSavingAttachments, setIsSavingAttachments] = useState(false)
  const setTargetItemId = useSetAtom(targetLineItemIdForMopAtom)
  const setPpmp = useSetAtom(selectedPpmpForEditAtom)

  useEffect(() => {
    setMetadataDraft(buildMetadataDraft(item))
    setRemarksDraft(item.remarks ?? '')
  }, [
    item.expectedDelivery,
    item.preProcurementConference,
    item.procurementEnd,
    item.procurementStart,
    item.projectType,
    item.remarks,
    item.sizeSpecification,
  ])

  const saveMetadata = useCallback(
    async (
      changes: Partial<
        Omit<UpdateLineItemMetadataPayload, 'ppmpId' | 'itemId'>
      >,
    ) => {
      if (isReadOnly) return

      setIsSavingMetadata(true)
      try {
        const updated = await updateLineItemMetadataRequest.fetcher({
          data: {
            ppmpId,
            itemId: item.id,
            ...changes,
          },
        })
        setPpmp(updated)
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : 'Failed to update procurement metadata.',
        )
      } finally {
        setIsSavingMetadata(false)
      }
    },
    [isReadOnly, item.id, ppmpId, setPpmp],
  )

  const setMetadataFieldError = useCallback(
    (field: MetadataField, message?: string) => {
      setMetadataErrors((prev) => {
        const next = { ...prev }
        if (message) {
          next[field] = message
        } else {
          delete next[field]
        }
        return next
      })
    },
    [],
  )

  const handleProjectTypeChange = useCallback(
    async (value: ProjectTypeSelectValue) => {
      setMetadataDraft((prev) => ({ ...prev, projectType: value }))
      await saveMetadata({ projectType: value === 'unset' ? null : value })
    },
    [saveMetadata],
  )

  const handlePreProcurementConferenceChange = useCallback(
    async (value: PreProcSelectValue) => {
      setMetadataDraft((prev) => ({ ...prev, preProcurementConference: value }))
      await saveMetadata({
        preProcurementConference: value === 'N/A' ? null : value,
      })
    },
    [saveMetadata],
  )

  const handleExpectedDeliveryChange = useCallback(
    async (value: string) => {
      const normalized = value.trim()
      setMetadataDraft((prev) => ({ ...prev, expectedDelivery: value }))

      if (!normalized) {
        setMetadataFieldError(
          'expectedDelivery',
          'Expected delivery is required.',
        )
        return
      }

      if (!isValidExpectedDeliveryPeriod(normalized)) {
        setMetadataFieldError('expectedDelivery', 'Use MM/YYYY format.')
        return
      }

      setMetadataFieldError('expectedDelivery')
      await saveMetadata({ expectedDelivery: normalized })
    },
    [saveMetadata, setMetadataFieldError],
  )

  const handleSizeSpecificationBlur = useCallback(
    async (value: string) => {
      const normalized = value.trim()
      setMetadataDraft((prev) => ({ ...prev, sizeSpecification: value }))

      setMetadataFieldError('sizeSpecification')
      await saveMetadata({ sizeSpecification: normalized || null })
    },
    [saveMetadata, setMetadataFieldError],
  )

  const handleProcurementPeriodChange = useCallback(
    async (field: 'procurementStart' | 'procurementEnd', value: string) => {
      const normalized = value.trim()

      setMetadataDraft((prev) => ({ ...prev, [field]: value }))

      setMetadataFieldError(field)
      await saveMetadata({ [field]: normalized || null })
    },
    [saveMetadata, setMetadataFieldError],
  )

  const handleRemarksSave = useCallback(async () => {
    const normalized = remarksDraft.trim()
    await saveMetadata({ remarks: normalized.length > 0 ? normalized : null })
    setRemarksPopoverOpen(false)
  }, [remarksDraft, saveMetadata])

  const handleAttachmentsChange = useCallback(
    async (nextAttachments: PPMPAttachment[]) => {
      if (isReadOnly) return

      setIsSavingAttachments(true)
      try {
        const updated = await updateLineItemAttachmentsRequest.fetcher({
          data: {
            ppmpId,
            itemId: item.id,
            attachments: nextAttachments,
          },
        })
        setPpmp(updated)
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : 'Failed to update attachments.',
        )
      } finally {
        setIsSavingAttachments(false)
      }
    },
    [isReadOnly, item.id, ppmpId, setPpmp],
  )

  const handleCellBlur = useCallback(
    (month: Month, rawValue: string) => {
      setEditingCell(null)
      const parsed = parseInt(rawValue, 10)
      if (Number.isNaN(parsed)) {
        setCellErrors((prev: Partial<Record<Month, string>>) => ({
          ...prev,
          [month]: 'Must be a whole number.',
        }))
        return
      }
      if (parsed < 0) {
        setCellErrors((prev: Partial<Record<Month, string>>) => ({
          ...prev,
          [month]: 'Cannot be negative.',
        }))
        return
      }
      setCellErrors((prev: Partial<Record<Month, string>>) => {
        const next = { ...prev }
        delete next[month]
        return next
      })
      onScheduleChange(item.id, month, parsed)
    },
    [item.id, onScheduleChange],
  )

  const setMopOverrideDialogOpen = useSetAtom(mopOverrideDialogOpenAtom)
  const setLinkScopingFormOpen = useSetAtom(linkScopingFormModalOpenAtom)
  const setTargetItemIdForMsf = useSetAtom(targetLineItemIdForMsfAtom)

  const handleOpenMopOverride = () => {
    if (isReadOnly) return
    setTargetItemId(item.id)
    setMopOverrideDialogOpen(true)
  }

  const handleOpenLinkScoping = () => {
    if (isReadOnly) return
    setTargetItemIdForMsf(item.id)
    setLinkScopingFormOpen(true)
  }

  const activeMoP = item.mopOverride ?? item.suggestedMoP
  const isMoPOverridden = item.mopOverride !== null

  const hasMsf = !!item.marketScopingId
  const isBudgetExceeded =
    hasMsf &&
    (item.marketScopingCostEstimate ?? null) !== null &&
    item.estimatedBudget > (item.marketScopingCostEstimate ?? Infinity)

  return (
    <tr
      className={cn(
        'group border-b border-border transition-colors hover:bg-muted/30',
        item.originDepartmentId ? 'bg-primary/5' : '',
        isBudgetExceeded ? 'bg-destructive/5 hover:bg-destructive/10' : '',
        isSelected ? 'bg-primary/10 hover:bg-primary/15' : '',
      )}
    >
      {/* Checkbox (selection for bulk MSF linking) */}
      {!isReadOnly && (
        <td className="px-2 py-2 text-center align-middle w-8">
          <input
            type="checkbox"
            aria-label={`Select ${item.itemName}`}
            checked={isSelected}
            onChange={(e) => onSelectChange?.(item.id, e.target.checked)}
            className="h-4 w-4 rounded border-border accent-primary cursor-pointer"
          />
        </td>
      )}

      {/* Item Name */}
      <td className="px-3 py-2 min-w-[200px] align-middle">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="text-sm font-medium text-foreground leading-tight">
              {item.itemName}
            </div>
            {isSavingMetadata && (
              <span className="inline-flex items-center text-[10px] text-muted-foreground gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-primary" />
                Saving...
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{item.unitOfMeasure}</span>
            {item.originDepartmentName && (
              <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
                Office: {item.originDepartmentName}
              </Badge>
            )}
          </div>
        </div>
      </td>

      {/* Activity Indicator Name */}
      <td className="px-2 py-2 align-middle min-w-[160px]">
        <span
          className="text-xs font-medium text-muted-foreground truncate max-w-[180px] block"
          title={activityName || item.activityIndicatorName || item.activityName || '—'}
        >
          {activityName || item.activityIndicatorName || item.activityName || '—'}
        </span>
      </td>

      <td className="px-2 py-2 align-middle min-w-[152px]">
        {isReadOnly ? (
          <span className="text-xs text-foreground">
            {displayNaValue(item.projectType)}
          </span>
        ) : (
          <Select
            value={metadataDraft.projectType}
            onValueChange={(value) =>
              handleProjectTypeChange(value as ProjectTypeSelectValue)
            }
            disabled={isSavingMetadata}
          >
            <SelectTrigger className="h-8 min-w-[136px] text-xs">
              <SelectValue placeholder="Project Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Goods">Goods</SelectItem>
              <SelectItem value="Infra">Infra</SelectItem>
              <SelectItem value="Consulting">Consulting</SelectItem>
              <SelectItem value="N/A">N/A / Not Applicable</SelectItem>
            </SelectContent>
          </Select>
        )}
      </td>

      <td
        className={cn(
          'px-2 py-2 align-middle min-w-[220px]',
          metadataErrors.sizeSpecification && 'bg-destructive/10',
        )}
      >
        {isReadOnly ? (
          <span className="text-xs text-foreground">
            {displayNaValue(item.sizeSpecification)}
          </span>
        ) : (
          <Input
            value={metadataDraft.sizeSpecification}
            placeholder={PPMP_FIELD_LABELS.quantityAndSize}
            onChange={(e) =>
              setMetadataDraft((prev) => ({
                ...prev,
                sizeSpecification: e.target.value,
              }))
            }
            onBlur={(e) => handleSizeSpecificationBlur(e.target.value)}
            className="h-8 min-w-[200px] text-xs"
            disabled={isSavingMetadata}
          />
        )}
      </td>

      <td className="px-2 py-2 align-middle min-w-[132px]">
        {isReadOnly ? (
          <span className="text-xs text-foreground">
            {displayPreProcurementConference(item.preProcurementConference)}
          </span>
        ) : (
          <div className="inline-flex rounded-md border border-input bg-background p-0.5">
            <button
              type="button"
              onClick={() => void handlePreProcurementConferenceChange('yes')}
              disabled={isSavingMetadata}
              className={cn(
                'h-7 rounded px-2 text-xs transition-colors',
                metadataDraft.preProcurementConference === 'yes'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => void handlePreProcurementConferenceChange('no')}
              disabled={isSavingMetadata}
              className={cn(
                'h-7 rounded px-2 text-xs transition-colors',
                metadataDraft.preProcurementConference === 'no'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              No
            </button>
            <button
              type="button"
              onClick={() => void handlePreProcurementConferenceChange('N/A')}
              disabled={isSavingMetadata}
              className={cn(
                'h-7 rounded px-2 text-xs transition-colors',
                metadataDraft.preProcurementConference === 'N/A'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              )}
            >
              N/A
            </button>
          </div>
        )}
      </td>

      <td
        className={cn(
          'px-2 py-2 align-middle min-w-[122px]',
          metadataErrors.procurementStart && 'bg-destructive/10',
        )}
      >
        {isReadOnly ? (
          <span className="text-xs text-foreground">
            {displayNaValue(item.procurementStart)}
          </span>
        ) : (
          <MonthYearPicker
            value={metadataDraft.procurementStart}
            placeholder="Pick MM/YYYY"
            onValueChange={(value) =>
              void handleProcurementPeriodChange('procurementStart', value)
            }
            disabled={isSavingMetadata}
          />
        )}
      </td>

      <td
        className={cn(
          'px-2 py-2 align-middle min-w-[122px]',
          metadataErrors.procurementEnd && 'bg-destructive/10',
        )}
      >
        {isReadOnly ? (
          <span className="text-xs text-foreground">
            {displayNaValue(item.procurementEnd)}
          </span>
        ) : (
          <MonthYearPicker
            value={metadataDraft.procurementEnd}
            placeholder="Pick MM/YYYY"
            onValueChange={(value) =>
              void handleProcurementPeriodChange('procurementEnd', value)
            }
            disabled={isSavingMetadata}
          />
        )}
      </td>

      <td
        className={cn(
          'px-2 py-2 align-middle min-w-[138px]',
          metadataErrors.expectedDelivery && 'bg-destructive/10',
        )}
      >
        {isReadOnly ? (
          <span className="text-xs text-foreground">
            {displayNaValue(item.expectedDelivery)}
          </span>
        ) : (
          <MonthYearPicker
            value={metadataDraft.expectedDelivery}
            placeholder="Pick MM/YYYY"
            onValueChange={(value) => void handleExpectedDeliveryChange(value)}
            disabled={isSavingMetadata}
          />
        )}
      </td>

      <td className="px-2 py-2 align-middle min-w-[220px]">
        {isReadOnly ? (
          <TruncatedRemarkPopover value={item.remarks} />
        ) : (
          <Popover
            open={remarksPopoverOpen}
            onOpenChange={(open) => {
              setRemarksPopoverOpen(open)
              if (open) {
                setRemarksDraft(item.remarks ?? '')
              }
            }}
          >
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full justify-start gap-2 text-xs text-left"
                disabled={isSavingMetadata}
              >
                <Pencil className="h-3.5 w-3.5" />
                {item.remarks?.trim() ? 'Edit remarks' : 'Add remarks'}
              </Button>
            </PopoverTrigger>
            <PopoverContent side="top" align="start" className="w-80 space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-medium leading-none">Remarks</p>
                <p className="text-xs text-muted-foreground">
                  Optional freeform note for this line item.
                </p>
              </div>
              <Textarea
                value={remarksDraft}
                onChange={(e) => setRemarksDraft(e.target.value)}
                placeholder="Add contextual notes, delivery considerations, or reminders."
                className="min-h-24 text-xs"
                disabled={isSavingMetadata}
              />
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  {remarksDraft.trim().length} characters
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setRemarksPopoverOpen(false)}
                    disabled={isSavingMetadata}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      void handleRemarksSave()
                    }}
                    disabled={isSavingMetadata}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        )}
      </td>

      <td className="px-2 py-2 align-middle min-w-60">
        <SupportingDocumentsCell
          title="Supporting documents"
          attachments={item.attachments ?? []}
          onAttachmentsChange={handleAttachmentsChange}
          isReadOnly={isReadOnly}
          disabled={isSavingMetadata || isSavingAttachments}
        />
      </td>

      {/* Unit Price */}
      <td className="px-3 py-2 text-right text-xs text-muted-foreground whitespace-nowrap align-middle">
        {formatCurrency(item.unitPrice)}
      </td>

      {/* Monthly Cells (Jan–Dec) */}
      {ALL_MONTHS.map((month) => (
        <td
          key={month}
          className={cn(
            'px-1 py-1 text-center align-middle',
            cellErrors[month] ? 'bg-destructive/10' : '',
          )}
        >
          {isReadOnly ? (
            <span className="block w-14 rounded px-1 py-0.5 text-center text-sm text-foreground">
              {item.monthlyQuantities[month] > 0
                ? item.monthlyQuantities[month]
                : '—'}
            </span>
          ) : editingCell === month ? (
            <Input
              type="number"
              min={0}
              step={1}
              defaultValue={item.monthlyQuantities[month] || ''}
              autoFocus
              onBlur={(e) => handleCellBlur(month, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === 'Tab') {
                  handleCellBlur(month, (e.target as HTMLInputElement).value)
                }
                if (e.key === 'Escape') setEditingCell(null)
              }}
              className={cn('h-8 w-14 rounded px-1 py-0.5 text-center text-sm')}
            />
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setEditingCell(month)}
                  className={cn(
                    'w-14 rounded px-1 py-0.5 text-center text-sm transition-colors',
                    'hover:bg-primary/10 hover:text-primary cursor-pointer',
                    item.monthlyQuantities[month] > 0
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground/50',
                    cellErrors[month] ? 'text-destructive' : '',
                  )}
                >
                  {item.monthlyQuantities[month] > 0
                    ? item.monthlyQuantities[month]
                    : '—'}
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                Click to add quantity for {MONTH_LABELS[month]}
              </TooltipContent>
            </Tooltip>
          )}
        </td>
      ))}

      {/* Total Quantity */}
      <td className="px-3 py-2 text-right font-semibold text-sm text-foreground whitespace-nowrap align-middle">
        {item.totalQuantity.toLocaleString()}
      </td>

      {/* Estimated Budget */}
      <td className="px-3 py-2 text-right text-sm font-semibold text-foreground whitespace-nowrap align-middle">
        {formatCurrency(item.estimatedBudget)}
      </td>

      {/* Mode of Procurement */}
      <td className="px-3 py-2 text-center align-middle">
        <div className="flex flex-col items-center gap-1">
          <Badge
            variant={isMoPOverridden ? 'outline' : 'soft'}
            className={cn(
              'text-[10px] transition-opacity',
              !isReadOnly && 'cursor-pointer hover:opacity-80',
              isMoPOverridden ? 'border-warning text-warning' : '',
            )}
            onClick={handleOpenMopOverride}
          >
            {activeMoP}
          </Badge>
          {isMoPOverridden && (
            <span className="text-[9px] text-warning">Overridden</span>
          )}
        </div>
      </td>

      {/* Market Scoping Reference */}
      <td className="px-2 py-2 text-center align-middle">
        {hasMsf ? (
          (() => {
            const refMissing = !item.marketScopingRef
            const costMissing = item.marketScopingCostEstimate == null
            const msfIncomplete = refMissing || costMissing
            const msfLabel =
              item.marketScopingRef ??
              (item.marketScopingId
                ? `Linked${String(item.marketScopingId).slice(0, 8)}`
                : 'Linked')
            return (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold transition-colors cursor-pointer',
                      isBudgetExceeded
                        ? 'bg-destructive/15 text-destructive border border-destructive/40 hover:bg-destructive/25'
                        : msfIncomplete
                          ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700'
                          : 'bg-emerald-100 text-emerald-700 border border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-700',
                    )}
                  >
                    {isBudgetExceeded || msfIncomplete ? (
                      <AlertCircle className="h-3 w-3" />
                    ) : (
                      <CheckCircle2 className="h-3 w-3" />
                    )}
                    {msfLabel}
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  side="top"
                  className="w-72 p-3 text-xs space-y-2"
                >
                  <div className="font-semibold text-sm flex items-center gap-1.5">
                    <Link2 className="h-3.5 w-3.5 text-primary" />
                    MSF Details
                  </div>

                  <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
                    <span className="text-muted-foreground">Reference:</span>
                    <span className="font-medium">
                      {item.marketScopingRef ?? (
                        <span className="text-muted-foreground">
                          — (missing)
                        </span>
                      )}
                    </span>

                    <span className="text-muted-foreground">
                      Cost Estimate:
                    </span>
                    <span
                      className={cn(
                        'font-medium',
                        isBudgetExceeded
                          ? 'text-destructive'
                          : 'text-emerald-600',
                      )}
                    >
                      {item.marketScopingCostEstimate != null ? (
                        formatCurrency(item.marketScopingCostEstimate)
                      ) : (
                        <span className="text-muted-foreground">
                          — (missing)
                        </span>
                      )}
                    </span>

                    <span className="text-muted-foreground">PPMP Total:</span>
                    <span className="font-medium">
                      {formatCurrency(item.estimatedBudget)}
                    </span>
                  </div>

                  {msfIncomplete && (
                    <div className="rounded bg-amber-50 border border-amber-200 px-2 py-1.5 text-amber-800 text-[10px]">
                      ⚠️ Linked MSF is missing {refMissing ? 'reference' : ''}
                      {refMissing && costMissing ? ' and ' : ''}
                      {costMissing ? 'cost estimate' : ''}. This MSF appears
                      incomplete — consider updating the MSF or linking a
                      different one.
                    </div>
                  )}

                  {isBudgetExceeded && (
                    <div className="rounded bg-destructive/10 border border-destructive/30 px-2 py-1.5 text-destructive text-[10px]">
                      ⚠️ PPMP total exceeds MSF cost estimate by{' '}
                      {formatCurrency(
                        item.estimatedBudget -
                        (item.marketScopingCostEstimate ?? 0),
                      )}
                      . Reduce quantity or link a different MSF.
                    </div>
                  )}

                  {!isReadOnly && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full h-7 text-xs mt-1"
                      onClick={handleOpenLinkScoping}
                    >
                      <Link2 className="mr-1.5 h-3 w-3" />
                      Change MSF
                    </Button>
                  )}
                </PopoverContent>
              </Popover>
            )
          })()
        ) : !isReadOnly ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2 text-[10px] gap-1 border-dashed text-muted-foreground hover:text-primary hover:border-primary"
                onClick={handleOpenLinkScoping}
              >
                <Link2 className="h-3 w-3" />
                Link MSF
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="text-xs max-w-[200px] text-center"
            >
              Link an Approved Market Scoping Form (required before submission)
            </TooltipContent>
          </Tooltip>
        ) : (
          <span className="text-xs text-muted-foreground">N/A</span>
        )}
      </td>

      {/* Actions */}
      <td className="px-2 py-2 text-center align-middle">
        {!isReadOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <span className="sr-only">Open actions</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={handleOpenMopOverride}
                className="cursor-pointer"
              >
                <Pencil className="mr-2 h-4 w-4" />
                Edit MoP
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(item.id)}
                disabled={isDeleting}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove item
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </td>
    </tr>
  )
}
