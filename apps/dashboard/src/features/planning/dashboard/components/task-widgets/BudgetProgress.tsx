/**
 * Budget Progress Widget
 * 
 * Displays UACS utilization percentage with progress bar
 * for Budget-related tasks (Line-Item Budgeting).
 * 
 * @module features/planning/dashboard/components/task-widgets/BudgetProgress
 */

import type { BudgetTaskMetadata } from '../../types'
import { Progress } from '@/components/ui/progress'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface BudgetProgressProps {
  metadata: BudgetTaskMetadata
}

export function BudgetProgress({ metadata }: BudgetProgressProps) {
  const { uacsCode, uacsDescription, utilizationPercent, utilizedAmount, allocatedAmount } = metadata

  const statusColor =
    utilizationPercent > 90
      ? 'text-red-600 dark:text-red-400'
      : utilizationPercent > 75
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400'

  return (
    <div className="mt-3 p-3 bg-muted/40 dark:bg-slate-800/55 rounded-lg border border-border/70">
      {/* UACS Code and Description */}
      <div className="mb-2">
        <div className="text-xs font-mono font-bold text-foreground">{uacsCode}</div>
        <div className="text-xs text-muted-foreground truncate">{uacsDescription}</div>
      </div>

      {/* Utilization Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-muted-foreground">Utilization</div>
        <div className={`text-sm font-bold tabular-nums ${statusColor}`}>
          {utilizationPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={utilizationPercent} className="h-2 mb-3" />

      {/* Budget Amounts */}
      <div className="flex items-center justify-between text-xs tabular-nums">
        <div>
          <span className="text-muted-foreground">Utilized: </span>
          <span className="font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrencyAbbr(utilizedAmount)}
          </span>
        </div>
        <div>
          <span className="text-muted-foreground">Allocated: </span>
          <span className="font-semibold text-foreground">
            {formatCurrencyAbbr(allocatedAmount)}
          </span>
        </div>
      </div>
    </div>
  )
}
