/**
 * InlineNonProcurableCostRow
 * Editable table row for non-procurable cost items.
 */

import { useCallback, useEffect, useState } from 'react'
import { AlertCircle, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import type { NonProcurableCost, Month, PPMPAttachment, ProjectType, PreProcurementConferenceValue } from '../types'
import { ALL_MONTHS } from '../types'
import {
  displayNaValue,
  displayPreProcurementConference,
} from '../lib/ppmpFieldDefaults'
import { formatCurrency } from '../lib/ppmpUtils'
import { isValidExpectedDeliveryPeriod } from '../lib/ppmpProcurementMetadata'
import { SupportingDocumentsCell } from './SupportingDocumentsCell'
import { MonthYearPicker } from './MonthYearPicker'
import { TruncatedRemarkPopover } from './TruncatedRemarkPopover'

interface InlineNonProcurableCostRowProps {
  cost: NonProcurableCost
  onUpdate: (cost: NonProcurableCost) => void
  onDelete: (costId: string) => void
  onEditMetadata?: (cost: NonProcurableCost) => void
  isNew?: boolean
  isReadOnly?: boolean
}

export function InlineNonProcurableCostRow({
  cost,
  onUpdate,
  onDelete,
  onEditMetadata,
  isNew = false,
  isReadOnly = false,
}: InlineNonProcurableCostRowProps) {
  const [editingCell, setEditingCell] = useState<
    | 'name'
    | 'projectType'
    | 'sizeSpec'
    | 'preProcConf'
    | 'procStart'
    | 'procEnd'
    | 'msfRef'
    | Month
    | null
  >(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [remarksOpen, setRemarksOpen] = useState(false)
  const [remarksDraft, setRemarksDraft] = useState(cost.remarks ?? '')
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<'expectedDelivery', string>>
  >({})
  const [tempValue, setTempValue] = useState('')

  const rowLocked = isReadOnly
  const nameLocked = rowLocked || cost.isReadOnly === true

  useEffect(() => {
    setRemarksDraft(cost.remarks ?? '')
  }, [cost.remarks])

  const setFieldError = useCallback(
    (field: 'expectedDelivery', message?: string) => {
      setFieldErrors((prev) => {
        const next = { ...prev }
        if (message) next[field] = message
        else delete next[field]
        return next
      })
    },
    [],
  )

  const hasFilledMonth = ALL_MONTHS.some(
    (month) =>
      cost.monthlyAllocations[month] && cost.monthlyAllocations[month] > 0,
  )
  const hasEmptyName =
    !cost.costItemName || cost.costItemName.trim().length === 0
  const isIncomplete = hasEmptyName || !hasFilledMonth

  const totalCost = Object.values(cost.monthlyAllocations).reduce(
    (sum, val) => sum + (val || 0),
    0,
  )

  const handleCellFocus = (
    cell: 'name' | Month,
    currentValue: string | number,
  ) => {
    if (rowLocked) return
    if (cell === 'name' && nameLocked) return
    setEditingCell(cell)
    setTempValue(String(currentValue ?? ''))
  }

  const handleCellBlur = () => {
    if (editingCell === 'name') {
      onUpdate({
        ...cost,
        costItemName: tempValue.trim(),
      })
    } else if (editingCell) {
      const month = editingCell as Month
      const numValue = parseFloat(tempValue) || 0
      onUpdate({
        ...cost,
        monthlyAllocations: {
          ...cost.monthlyAllocations,
          [month]: numValue,
        },
      })
    }
    setEditingCell(null)
    setTempValue('')
  }

  const handleExpectedDeliveryChange = useCallback(
    (value: string) => {
      const normalized = value.trim()
      if (!normalized) {
        setFieldError('expectedDelivery', 'Expected delivery is required.')
        return
      }

      if (!isValidExpectedDeliveryPeriod(normalized)) {
        setFieldError('expectedDelivery', 'Use MM/YYYY format.')
        return
      }

      setFieldError('expectedDelivery')
      onUpdate({
        ...cost,
        expectedDelivery: normalized,
      })
    },
    [cost, onUpdate, setFieldError],
  )

  const handleRemarksSave = useCallback(() => {
    onUpdate({
      ...cost,
      remarks: remarksDraft.trim().length > 0 ? remarksDraft.trim() : null,
    })
    setRemarksOpen(false)
  }, [cost, onUpdate, remarksDraft])

  const handleAttachmentsChange = useCallback(
    (nextAttachments: PPMPAttachment[]) => {
      onUpdate({
        ...cost,
        attachments: nextAttachments,
      })
    },
    [cost, onUpdate],
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      handleCellBlur()
      e.preventDefault()
    } else if (e.key === 'Escape') {
      setEditingCell(null)
      setTempValue('')
    }
  }

  const handleConfirmDelete = () => {
    if (isReadOnly) return
    onDelete(cost.id)
    setShowDeleteDialog(false)
  }

  return (
    <>
      <tr
        className={cn(
          'hover:bg-muted/30 transition-colors border-b border-border last:border-b-0',
          isNew && 'bg-blue-50/30 dark:bg-blue-950/20',
          isIncomplete && 'bg-yellow-50/30 dark:bg-yellow-950/20',
        )}
      >
        <td className="py-2 px-3 font-medium cursor-pointer hover:bg-muted/40 transition-colors">
          {nameLocked ? (
            <div className="min-w-0">
              <div className="text-foreground truncate">
                {cost.costItemName || '(empty)'}
              </div>
              {cost.standardUnitCost != null && (
                <p className="text-[11px] text-muted-foreground">
                  Unit cost: {formatCurrency(cost.standardUnitCost)}
                </p>
              )}
            </div>
          ) : editingCell === 'name' ? (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={handleCellBlur}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full px-2 py-1 border border-input rounded text-sm bg-background"
              placeholder="e.g., Per Diem, Travel..."
            />
          ) : (
            <div
              onClick={() => handleCellFocus('name', cost.costItemName)}
              className="text-foreground truncate"
            >
              {cost.costItemName || '(empty)'}
            </div>
          )}
        </td>

        <td
          className={cn(
            'py-2 px-2 text-center transition-colors',
            fieldErrors.expectedDelivery && 'bg-destructive/10',
          )}
        >
          {rowLocked ? (
            <span className="text-xs text-foreground">
              {cost.expectedDelivery?.trim() ? cost.expectedDelivery : '—'}
            </span>
          ) : (
            <MonthYearPicker
              value={cost.expectedDelivery ?? ''}
              placeholder="Pick MM/YYYY"
              onValueChange={handleExpectedDeliveryChange}
              disabled={rowLocked}
            />
          )}
          {!rowLocked && fieldErrors.expectedDelivery && (
            <div className="mt-1 text-[10px] text-destructive">
              {fieldErrors.expectedDelivery}
            </div>
          )}
        </td>

        <td className="py-2 px-2 text-center">
          {rowLocked ? (
            <TruncatedRemarkPopover value={cost.remarks} />
          ) : (
            <Popover
              open={remarksOpen}
              onOpenChange={(open) => {
                setRemarksOpen(open)
                if (open) {
                  setRemarksDraft(cost.remarks ?? '')
                }
              }}
            >
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 w-full justify-start gap-1.5 text-xs"
                  disabled={rowLocked}
                >
                  <Pencil className="h-3 w-3" />
                  {cost.remarks?.trim() ? 'Edit' : 'Add'}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                side="top"
                align="start"
                className="w-80 space-y-3"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">Remarks</p>
                  <p className="text-xs text-muted-foreground">
                    Optional note for this non-procurable cost row.
                  </p>
                </div>
                <Textarea
                  value={remarksDraft}
                  onChange={(e) => setRemarksDraft(e.target.value)}
                  placeholder="Add a note about scope, timing, or sourcing."
                  className="min-h-24 text-xs"
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
                      onClick={() => setRemarksOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="button" size="sm" onClick={handleRemarksSave}>
                      Save
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </td>

        <td className="py-2 px-2 align-middle min-w-60">
          <SupportingDocumentsCell
            title="Supporting documents"
            attachments={cost.attachments ?? []}
            onAttachmentsChange={handleAttachmentsChange}
            isReadOnly={rowLocked}
          />
        </td>

        {/* NEW: Metadata Columns */}
        {/* Project Type - Editable */}
        <td className="py-2 px-2 text-center text-xs whitespace-nowrap">
          {rowLocked ? (
            <span className="text-muted-foreground">
              {cost.projectType || 'N/A'}
            </span>
          ) : editingCell === 'projectType' ? (
            <select
              value={cost.projectType || 'unset'}
              onChange={(e) => {
                onUpdate({
                  ...cost,
                  projectType:
                    e.target.value === 'unset' ? null : (e.target.value as ProjectType),
                })
                setEditingCell(null)
              }}
              onBlur={() => setEditingCell(null)}
              autoFocus
              className="h-7 px-1.5 rounded border border-input bg-background text-xs"
            >
              <option value="unset">Not set</option>
              <option value="Goods">Goods</option>
              <option value="Infra">Infra</option>
              <option value="Consulting">Consulting</option>
              <option value="N/A">N/A</option>
            </select>
          ) : (
            <div
              onClick={() => setEditingCell('projectType')}
              className="cursor-pointer text-foreground hover:bg-muted/50 px-1 py-0.5 rounded"
            >
              {cost.projectType || 'N/A'}
            </div>
          )}
        </td>

        {/* Quantity and Size of the Project to be Procured - Editable */}
        <td className="py-2 px-2 text-left text-xs whitespace-nowrap max-w-xs">
          {rowLocked ? (
            <span className="text-muted-foreground">
              {cost.sizeSpecification || 'N/A'}
            </span>
          ) : editingCell === 'sizeSpec' ? (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                onUpdate({ ...cost, sizeSpecification: tempValue || null })
                setEditingCell(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdate({ ...cost, sizeSpecification: tempValue || null })
                  setEditingCell(null)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              autoFocus
              className="w-full h-7 px-1.5 rounded border border-input bg-background text-xs"
              placeholder="Enter size..."
            />
          ) : (
            <div
              onClick={() => {
                setTempValue(cost.sizeSpecification || '')
                setEditingCell('sizeSpec')
              }}
              title={cost.sizeSpecification || undefined}
              className="cursor-pointer text-foreground hover:bg-muted/50 px-1 py-0.5 rounded truncate"
            >
              {cost.sizeSpecification ? (
                cost.sizeSpecification.length > 20 ? (
                  `${cost.sizeSpecification.substring(0, 20)}...`
                ) : (
                  cost.sizeSpecification
                )
              ) : (
                <span className="text-muted-foreground">N/A</span>
              )}
            </div>
          )}
        </td>

        {/* Pre-Procurement Conference - Editable */}
        <td className="py-2 px-2 text-center text-xs whitespace-nowrap">
          {rowLocked ? (
            <span className="text-muted-foreground">
              {displayPreProcurementConference(cost.preProcurementConference)}
            </span>
          ) : editingCell === 'preProcConf' ? (
            <select
              value={cost.preProcurementConference || 'N/A'}
              onChange={(e) => {
                onUpdate({
                  ...cost,
                  preProcurementConference:
                    e.target.value === 'N/A' ? null : (e.target.value as PreProcurementConferenceValue),
                })
                setEditingCell(null)
              }}
              onBlur={() => setEditingCell(null)}
              autoFocus
              className="h-7 px-1.5 rounded border border-input bg-background text-xs"
            >
              <option value="yes">Yes</option>
              <option value="no">No</option>
              <option value="N/A">N/A</option>
            </select>
          ) : (
            <div
              onClick={() => setEditingCell('preProcConf')}
              className="cursor-pointer text-foreground hover:bg-muted/50 px-1 py-0.5 rounded"
            >
              {displayPreProcurementConference(cost.preProcurementConference)}
            </div>
          )}
        </td>

        {/* Procurement Period (Start → End) - Editable */}
        <td className="py-2 px-2 text-center text-xs whitespace-nowrap">
          {rowLocked ? (
            <span className="text-muted-foreground">
              {cost.procurementStart || cost.procurementEnd ? (
                <div className="space-y-0.5">
                  {cost.procurementStart && (
                    <div className="text-foreground font-medium">
                      {cost.procurementStart}
                    </div>
                  )}
                  {cost.procurementEnd && (
                    <div className="text-muted-foreground text-[10px]">
                      → {cost.procurementEnd}
                    </div>
                  )}
                </div>
              ) : (
                'N/A'
              )}
            </span>
          ) : editingCell === 'procStart' ? (
            <div className="space-y-1">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => {
                  onUpdate({ ...cost, procurementStart: tempValue || null })
                  setEditingCell(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setEditingCell(null)
                }}
                autoFocus
                placeholder="Start"
                className="h-6 px-1.5 rounded border border-input bg-background text-xs w-full"
              />
            </div>
          ) : editingCell === 'procEnd' ? (
            <div className="space-y-1">
              <input
                type="text"
                value={tempValue}
                onChange={(e) => setTempValue(e.target.value)}
                onBlur={() => {
                  onUpdate({ ...cost, procurementEnd: tempValue || null })
                  setEditingCell(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setEditingCell(null)
                }}
                autoFocus
                placeholder="End"
                className="h-6 px-1.5 rounded border border-input bg-background text-xs w-full"
              />
            </div>
          ) : (
            <div
              className="space-y-0.5"
              onClick={() => {
                setTempValue(cost.procurementStart || '')
                setEditingCell('procStart')
              }}
            >
              {cost.procurementStart ? (
                <div className="text-foreground cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded">
                  {cost.procurementStart}
                </div>
              ) : (
                <div className="text-muted-foreground cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded">
                  N/A
                </div>
              )}
              {cost.procurementEnd ? (
                <div
                  className="text-muted-foreground text-[10px] cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTempValue(cost.procurementEnd || '')
                    setEditingCell('procEnd')
                  }}
                >
                  → {cost.procurementEnd}
                </div>
              ) : (
                <div
                  className="text-muted-foreground text-[10px] cursor-pointer hover:bg-muted/50 px-1 py-0.5 rounded"
                  onClick={(e) => {
                    e.stopPropagation()
                    setTempValue('')
                    setEditingCell('procEnd')
                  }}
                >
                  → (End)
                </div>
              )}
            </div>
          )}
        </td>

        {/* Market Scoping Reference - Editable */}
        <td className="py-2 px-2 text-center text-xs whitespace-nowrap">
          {rowLocked ? (
            <span className="text-muted-foreground">
              {displayNaValue(cost.marketScopingRef)}
            </span>
          ) : editingCell === 'msfRef' ? (
            <input
              type="text"
              value={tempValue}
              onChange={(e) => setTempValue(e.target.value)}
              onBlur={() => {
                onUpdate({ ...cost, marketScopingRef: tempValue || null })
                setEditingCell(null)
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onUpdate({ ...cost, marketScopingRef: tempValue || null })
                  setEditingCell(null)
                } else if (e.key === 'Escape') {
                  setEditingCell(null)
                }
              }}
              autoFocus
              className="w-full h-7 px-1.5 rounded border border-input bg-background text-xs"
              placeholder="Enter reference..."
            />
          ) : (
            <div
              onClick={() => {
                setTempValue(cost.marketScopingRef || '')
                setEditingCell('msfRef')
              }}
              className="cursor-pointer text-foreground hover:bg-muted/50 px-1 py-0.5 rounded"
            >
              {cost.marketScopingRef ? (
                <span className="inline-block px-2 py-1 bg-muted rounded text-xs font-mono font-medium text-foreground">
                  {cost.marketScopingRef}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  {displayNaValue(cost.marketScopingRef)}
                </span>
              )}
            </div>
          )}
        </td>

        {ALL_MONTHS.map((month) => {
          const value = cost.monthlyAllocations[month]
          const isEmpty = !value || value === 0
          const isEditing = editingCell === month

          return (
            <td
              key={month}
              className={cn(
                'py-2 px-1 text-center transition-colors',
                !rowLocked && 'cursor-pointer hover:bg-muted/40',
                isEmpty && !isEditing && 'bg-destructive/5',
              )}
            >
              {rowLocked ? (
                <div
                  className={cn(
                    'text-sm font-medium',
                    isEmpty ? 'text-destructive' : 'text-foreground',
                  )}
                >
                  {isEmpty ? '—' : formatCurrency(value)}
                </div>
              ) : isEditing ? (
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onBlur={handleCellBlur}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="w-full px-1 py-1 border border-input rounded text-center text-xs bg-background"
                />
              ) : (
                <div
                  onClick={() => handleCellFocus(month, value)}
                  className={cn(
                    'text-sm font-medium',
                    isEmpty ? 'text-destructive' : 'text-foreground',
                  )}
                >
                  {isEmpty ? '—' : formatCurrency(value)}
                </div>
              )}
            </td>
          )
        })}

        <td className="py-2 px-3 text-right font-semibold text-foreground">
          {formatCurrency(totalCost)}
        </td>

        <td className="py-2 px-3 text-center">
          {isIncomplete ? (
            <Badge
              variant="outline"
              className="gap-1 bg-yellow-50 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800"
            >
              <AlertCircle className="h-3 w-3" />
              Incomplete
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="gap-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800"
            >
              ✓ Complete
            </Badge>
          )}
        </td>

        <td className="py-2 px-3 text-center">
          {!isReadOnly && (
            <div className="flex items-center justify-center gap-1">
              {onEditMetadata && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditMetadata(cost)}
                  className="h-6 w-6 p-0 hover:bg-primary/10 hover:text-primary"
                  title="Edit metadata"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive"
                title="Delete cost item"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </td>
      </tr>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Cost Item</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{cost.costItemName}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
