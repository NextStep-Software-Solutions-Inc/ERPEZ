/**
 * AddNonProcurableCostDialog
 * Modal for adding/editing a cost category to a non-procurable IoE block
 * Simplified UI: Manual monthly cost entry with table layout matching ScheduleMatrixRow
 * User enters individual monthly amounts; total is auto-calculated
 */

import { useState, useMemo } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NonProcurableCost, NonProcurableMoP } from '../types'
import { PPMP_METADATA_DEFAULTS } from '../lib/ppmpFieldDefaults'
import { sumMonthlyAllocations, isOverBudget } from '../lib/distributionUtils'
import {
  ALL_MONTHS,
  MONTH_LABELS,
  createEmptyMonthlyQuantities,
  type MonthlyQuantities,
} from '../types'
import { formatCurrency } from '../lib/ppmpUtils'
import { ResponsiveDialogDashtail } from '@/components/ResponsiveDialogDashtail'

interface AddNonProcurableCostDialogProps {
  open: boolean
  budgetLimit: number
  onOpenChange: (open: boolean) => void
  onSubmit: (cost: NonProcurableCost) => void
  initialData?: NonProcurableCost
}

const MOP_OPTIONS: Array<{ value: NonProcurableMoP; label: string }> = [
  { value: 'request-for-quote', label: 'Request for Quote' },
  { value: 'direct-purchase', label: 'Direct Purchase' },
  { value: 'in-house', label: 'In-House' },
]

export function AddNonProcurableCostDialog({
  open,
  budgetLimit,
  onOpenChange,
  onSubmit,
  initialData,
}: AddNonProcurableCostDialogProps) {
  const [categoryName, setCategoryName] = useState(
    initialData?.costItemName || '',
  )
  const [mop, setMop] = useState<NonProcurableMoP | null>(
    initialData?.mop || null,
  )
  const [expectedDelivery, setExpectedDelivery] = useState(
    initialData?.expectedDelivery || '',
  )
  const [remarks, setRemarks] = useState(initialData?.remarks || '')
  const [monthlyAllocations, setMonthlyAllocations] =
    useState<MonthlyQuantities>(
      initialData?.monthlyAllocations || createEmptyMonthlyQuantities(),
    )
  const [editingCell, setEditingCell] = useState<string | null>(null)

  // Calculate totals and percentages
  const totalCost = useMemo(
    () => sumMonthlyAllocations(monthlyAllocations),
    [monthlyAllocations],
  )

  const isOverLimit = isOverBudget(monthlyAllocations, budgetLimit)
  const canSubmit =
    categoryName.trim().length > 0 && totalCost > 0 && !isOverLimit

  // Handle monthly cell value change
  const handleMonthChange = (month: string, value: string) => {
    const numValue = parseFloat(value) || 0
    setMonthlyAllocations((prev) => ({
      ...prev,
      [month]: numValue,
    }))
  }

  // Handle form submission
  const handleSubmit = () => {
    if (!canSubmit) return

    const newCost: NonProcurableCost = {
      id: initialData?.id || `cost-${Date.now()}`,
      costItemName: categoryName.trim(),
      totalCost,
      monthlyAllocations,
      distributionPattern: 'custom',
      mop: mop || null,
      standardUnitCost: initialData?.standardUnitCost ?? null,
      isCustom: initialData?.isCustom ?? true,
      isReadOnly: initialData?.isReadOnly ?? false,
      isComplete: true,
      expectedDelivery:
        expectedDelivery.trim().length > 0 ? expectedDelivery.trim() : null,
      remarks: remarks.trim().length > 0 ? remarks.trim() : null,
      projectType:
        initialData?.projectType ?? PPMP_METADATA_DEFAULTS.projectType,
      sizeSpecification:
        initialData?.sizeSpecification ??
        PPMP_METADATA_DEFAULTS.sizeSpecification,
      preProcurementConference:
        initialData?.preProcurementConference ??
        PPMP_METADATA_DEFAULTS.preProcurementConference,
      procurementStart:
        initialData?.procurementStart ??
        PPMP_METADATA_DEFAULTS.procurementStart,
      procurementEnd:
        initialData?.procurementEnd ?? PPMP_METADATA_DEFAULTS.procurementEnd,
      marketScopingId:
        initialData?.marketScopingId ?? PPMP_METADATA_DEFAULTS.marketScopingId,
      marketScopingRef:
        initialData?.marketScopingRef ??
        PPMP_METADATA_DEFAULTS.marketScopingRef,
    }

    onSubmit(newCost)

    // Reset form
    setCategoryName('')
    setMop(null)
    setExpectedDelivery('')
    setRemarks('')
    setMonthlyAllocations(createEmptyMonthlyQuantities())
    setEditingCell(null)
    onOpenChange(false)
  }

  // Handle dialog close
  const handleClose = () => {
    setEditingCell(null)
    onOpenChange(false)
  }

  return (
    <ResponsiveDialogDashtail
      open={open}
      onOpenChange={handleClose}
      title={
        initialData ? 'Edit Non-Procurable Cost' : 'Add Non-Procurable Cost'
      }
      footer={
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            title={
              !categoryName.trim()
                ? 'Category name is required'
                : totalCost === 0
                  ? 'Total cost must be greater than 0'
                  : isOverLimit
                    ? 'Total exceeds budget limit'
                    : ''
            }
          >
            {initialData ? 'Update Cost' : 'Add Cost'}
          </Button>
        </div>
      }
      size="4xl"
    >
      <div className="space-y-6">
        {/* Category Name & MoP */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="categoryName" className="text-sm font-medium">
              Category Name *
            </Label>
            <Input
              id="categoryName"
              placeholder="e.g., Labor, Materials, Consulting"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="mop" className="text-sm font-medium">
              Mode of Procurement (Optional)
            </Label>
            <Select
              value={mop || ''}
              onValueChange={(value) =>
                setMop(value ? (value as NonProcurableMoP) : null)
              }
            >
              <SelectTrigger id="mop" className="mt-1">
                <SelectValue placeholder="Not specified" />
              </SelectTrigger>
              <SelectContent>
                {MOP_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expectedDelivery" className="text-sm font-medium">
              Expected Delivery (Optional)
            </Label>
            <Input
              id="expectedDelivery"
              placeholder="MM/YYYY"
              value={expectedDelivery}
              onChange={(e) => setExpectedDelivery(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="remarks" className="text-sm font-medium">
              Remarks (Optional)
            </Label>
            <Textarea
              id="remarks"
              placeholder="Add a short note about this cost row."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="mt-1 min-h-20"
            />
          </div>
        </div>

        {/* Cost Timeline Table */}
        <div className="border rounded-lg p-4 bg-card overflow-x-auto">
          <Label className="text-sm font-semibold mb-3 block">
            Cost Timeline
          </Label>
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left font-semibold py-2 px-2 whitespace-nowrap">
                  Category
                </th>
                {ALL_MONTHS.map((month) => (
                  <th
                    key={month}
                    className="text-center font-semibold py-2 px-1 whitespace-nowrap"
                  >
                    {MONTH_LABELS[month]}
                  </th>
                ))}
                <th className="text-center font-semibold py-2 px-2 whitespace-nowrap">
                  Total
                </th>
                <th className="text-center font-semibold py-2 px-2 whitespace-nowrap">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border hover:bg-muted/30 last:border-b-0">
                <td className="py-2 px-2 font-medium truncate max-w-xs">
                  {categoryName || '(Category)'}
                </td>
                {ALL_MONTHS.map((month) => {
                  const isEditing = editingCell === month
                  const value = monthlyAllocations[month]
                  return (
                    <td
                      key={month}
                      className="py-2 px-1 text-center cursor-pointer hover:bg-muted transition-colors"
                      onClick={() => setEditingCell(month)}
                    >
                      {isEditing ? (
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={value || 0}
                          onChange={(e) =>
                            handleMonthChange(month, e.target.value)
                          }
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') setEditingCell(null)
                            if (e.key === 'Escape') setEditingCell(null)
                          }}
                          autoFocus
                          className="w-16 px-1 py-1 border border-input rounded text-right text-xs"
                        />
                      ) : (
                        <span className="text-foreground font-medium">
                          {formatCurrency(value)}
                        </span>
                      )}
                    </td>
                  )
                })}
                <td className="py-2 px-2 text-center font-semibold text-foreground">
                  {formatCurrency(totalCost)}
                </td>
                <td className="py-2 px-2 text-center text-muted-foreground">
                  100%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Budget Info & Warning */}
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded p-3">
            <p className="text-xs font-medium text-blue-900 dark:text-blue-100">
              <strong>Budget Limit:</strong> {formatCurrency(budgetLimit)}
            </p>
          </div>

          {isOverLimit && (
            <div className="border border-destructive bg-destructive/10 rounded p-3 flex items-start gap-3">
              <AlertCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                Total cost ({formatCurrency(totalCost)}) exceeds budget limit (
                {formatCurrency(budgetLimit)}). Reduce monthly allocations.
              </p>
            </div>
          )}
        </div>
      </div>
    </ResponsiveDialogDashtail>
  )
}
