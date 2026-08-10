/**
 * DepartmentBudgetTracker
 * Sticky summary card for department-level PPMPs that shows the linked LIB
 * allocation, current committed total, and remaining balance.
 */

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { mockLineItemBudgets, mockPpmpDatabase } from '../data/mockPpmpData'
import type { PPMP } from '../types'
import { computeRemainingLibBudget, formatCurrency } from '../lib/ppmpUtils'

interface DepartmentBudgetTrackerProps {
  ppmp: PPMP
  className?: string
  importedCount?: number
}

export function DepartmentBudgetTracker({
  ppmp,
  className,
  importedCount = 0,
}: DepartmentBudgetTrackerProps) {
  const lib = mockLineItemBudgets.find((item) => item.id === ppmp.libId)

  if (!lib) {
    return (
      <div
        className={cn(
          'rounded-xl border border-dashed border-border p-4',
          className,
        )}
      >
        <p className="text-sm font-medium text-foreground">
          Linked LIB not found
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          This PPMP needs a valid LIB mapping before the budget tracker can be
          shown.
        </p>
      </div>
    )
  }

  const remainingBudget = computeRemainingLibBudget(
    lib.totalAllocation,
    mockPpmpDatabase,
    lib.id,
    ppmp.fiscalYear,
  )
  const committedBudget = lib.totalAllocation - remainingBudget
  const usedPercent = Math.min(
    100,
    Math.max(0, (committedBudget / Math.max(lib.totalAllocation, 1)) * 100),
  )
  const isOverBudget = remainingBudget < 0

  return (
    <div
      className={cn(
        'overflow-hidden rounded-2xl border border-border/70 bg-gradient-to-br from-white to-slate-50 p-6 shadow-sm',
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Badge variant="outline">Department LIB budget</Badge>
            <span className="truncate text-sm font-semibold text-foreground">
              {lib.code}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{lib.name}</p>
        </div>
        <Badge variant="soft" color={isOverBudget ? 'destructive' : 'success'}>
          {isOverBudget ? 'Over budget' : 'Within budget'}
        </Badge>
        <Badge
          variant={importedCount > 0 ? 'soft' : 'outline'}
          color="secondary"
        >
          {importedCount} imported department PPMP
          {importedCount === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-white/80 p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            LIB Allocation
          </div>
          <div className="mt-1 text-sm font-semibold">
            {formatCurrency(lib.totalAllocation)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white/80 p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Current PPMP Total
          </div>
          <div className="mt-1 text-sm font-semibold">
            {formatCurrency(committedBudget)}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-white/80 p-4 shadow-sm">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Remaining Balance
          </div>
          <div
            className={cn(
              'mt-1 text-sm font-semibold',
              isOverBudget ? 'text-destructive' : 'text-foreground',
            )}
          >
            {formatCurrency(remainingBudget)}
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            {usedPercent.toFixed(0)}% of the budget is currently committed
          </span>
          <span>{ppmp.fiscalYear}</span>
        </div>
        <Progress
          value={usedPercent}
          color={isOverBudget ? 'destructive' : 'primary'}
          size="sm"
          className="h-3"
        />
      </div>
    </div>
  )
}
