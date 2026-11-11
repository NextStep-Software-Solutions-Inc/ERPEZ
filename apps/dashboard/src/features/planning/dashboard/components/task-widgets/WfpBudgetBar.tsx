/**
 * WFP Budget Bar Widget
 * 
 * Displays budget utilization progress bar and remaining balance
 * for WFP (Externally Funded Projects) tasks.
 * 
 * @module features/planning/dashboard/components/task-widgets/WfpBudgetBar
 */

import type { WFPTaskMetadata } from '../../types'
import { Progress } from '@/components/ui/progress'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface WfpBudgetBarProps {
  metadata: WFPTaskMetadata
}

export function WfpBudgetBar({ metadata }: WfpBudgetBarProps) {
  const { totalBudget, utilizedBudget, remainingBudget, utilizationPercent } = metadata

  const statusColor =
    utilizationPercent > 85
      ? 'text-red-600 dark:text-red-400'
      : utilizationPercent > 70
        ? 'text-amber-600 dark:text-amber-400'
        : 'text-emerald-600 dark:text-emerald-400'

  return (
    <div className="mt-3 p-3 bg-muted/40 dark:bg-slate-800/55 rounded-lg border border-border/70">
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs font-medium text-muted-foreground">Budget Utilization</div>
        <div className={`text-sm font-bold tabular-nums ${statusColor}`}>
          {utilizationPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={utilizationPercent} className="h-2 mb-3" />

      {/* Budget Details */}
      <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
        <div>
          <div className="text-muted-foreground">Total Budget</div>
          <div className="font-semibold text-foreground">
            {formatCurrencyAbbr(totalBudget)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Utilized</div>
          <div className="font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrencyAbbr(utilizedBudget)}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Remaining</div>
          <div className="font-semibold text-emerald-600 dark:text-emerald-400">
            {formatCurrencyAbbr(remainingBudget)}
          </div>
        </div>
      </div>
    </div>
  )
}
