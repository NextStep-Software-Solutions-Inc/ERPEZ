/**
 * LibItemSelector
 * Displays a LIB picker with remaining balance computed from all PPMPs that
 * currently reference the selected budget line.
 */

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { mockLineItemBudgets, mockPpmpDatabase } from '../data/mockPpmpData'
import type { LineItemBudget } from '../types'
import { formatCurrency } from '../lib/ppmpUtils'

interface LibSummary extends LineItemBudget {
  committedBudget: number
  remainingBalance: number
  consumingPpmpCount: number
}

interface LibItemSelectorProps {
  value: string
  onChange: (value: string) => void
  availableLIBs: LineItemBudget[]
  disabled?: boolean
  className?: string
  id?: string
}

function buildSummary(lib: LineItemBudget): LibSummary {
  const consumingPpmps = mockPpmpDatabase.filter(
    (ppmp) => ppmp.libId === lib.id,
  )
  const committedBudget = consumingPpmps.reduce(
    (sum, ppmp) => sum + ppmp.totalBudget,
    0,
  )

  return {
    ...lib,
    committedBudget,
    remainingBalance: lib.totalAllocation - committedBudget,
    consumingPpmpCount: consumingPpmps.length,
  }
}

export function LibItemSelector({
  value,
  onChange,
  availableLIBs,
  disabled = false,
  className,
  id,
  ...props
}: LibItemSelectorProps) {
  const libOptions =
    availableLIBs.length > 0 ? availableLIBs : mockLineItemBudgets
  const describedBy = (props as { 'aria-describedby'?: string })[
    'aria-describedby'
  ]
  const ariaInvalid = (props as { 'aria-invalid'?: boolean })['aria-invalid']

  const summaries = useMemo(
    () => libOptions.map((lib) => buildSummary(lib)),
    [libOptions],
  )

  const selectedSummary = useMemo(
    () => summaries.find((lib) => lib.id === value) ?? null,
    [summaries, value],
  )

  return (
    <div className={cn('space-y-3', className)} {...props}>
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger
          id={id}
          aria-describedby={describedBy}
          aria-invalid={ariaInvalid}
          className="h-10"
        >
          <SelectValue placeholder="Select a budget line" />
        </SelectTrigger>
        <SelectContent>
          {summaries.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No budgets available for the selected fiscal year.
            </div>
          ) : (
            summaries.map((lib) => (
              <SelectItem
                key={lib.id}
                value={lib.id}
                className="items-start gap-2 py-3"
              >
                <div className="flex w-full items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="truncate text-foreground">{lib.name}</div>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>

      {selectedSummary ? (
        <div className="rounded-lg border border-border bg-muted/30 p-3">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-medium text-foreground">
                {selectedSummary.name}
              </div>
            </div>
            <Badge
              variant="soft"
              color={
                selectedSummary.remainingBalance >= 0
                  ? 'success'
                  : 'destructive'
              }
            >
              {selectedSummary.remainingBalance >= 0
                ? 'Within budget'
                : 'Over budget'}
            </Badge>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-background/80 p-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Total Allocation
              </div>
              <div className="mt-1 text-sm font-semibold">
                {formatCurrency(selectedSummary.totalAllocation)}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/80 p-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Committed
              </div>
              <div className="mt-1 text-sm font-semibold">
                {formatCurrency(selectedSummary.committedBudget)}
              </div>
            </div>
            <div className="rounded-md border border-border bg-background/80 p-2">
              <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
                Remaining
              </div>
              <div
                className={cn(
                  'mt-1 text-sm font-semibold',
                  selectedSummary.remainingBalance < 0
                    ? 'text-destructive'
                    : 'text-foreground',
                )}
              >
                {selectedSummary.remainingBalance < 0
                  ? `-${formatCurrency(Math.abs(selectedSummary.remainingBalance))}`
                  : formatCurrency(selectedSummary.remainingBalance)}
              </div>
            </div>
          </div>

          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
              <span>
                {selectedSummary.consumingPpmpCount} PPMP
                {selectedSummary.consumingPpmpCount === 1 ? '' : 's'} using this
                LIB
              </span>
              <span>
                {selectedSummary.totalAllocation > 0
                  ? `${Math.min(
                      100,
                      Math.max(
                        0,
                        (selectedSummary.committedBudget /
                          selectedSummary.totalAllocation) *
                          100,
                      ),
                    ).toFixed(0)}% committed`
                  : '0% committed'}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-background">
              <div
                className={cn(
                  'h-full rounded-full transition-all',
                  selectedSummary.remainingBalance < 0
                    ? 'bg-destructive'
                    : 'bg-primary',
                )}
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      (selectedSummary.committedBudget /
                        Math.max(selectedSummary.totalAllocation, 1)) *
                        100,
                    ),
                  )}%`,
                }}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
          Choose a LIB to view the remaining balance across all PPMPs that
          already use it.
        </div>
      )}
    </div>
  )
}
