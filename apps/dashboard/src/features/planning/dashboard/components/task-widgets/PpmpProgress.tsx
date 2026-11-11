/**
 * PPMP Progress Widget
 * 
 * Displays PPMP/APP consolidation progress with donut-style
 * progress indicator for Procurement-related tasks.
 * 
 * @module features/planning/dashboard/components/task-widgets/PpmpProgress
 */

import { Progress } from '@/components/ui/progress'
import { Package } from 'lucide-react'
import type { ProcurementTaskMetadata } from '../../types'

interface PpmpProgressProps {
  metadata: ProcurementTaskMetadata
}

export function PpmpProgress({ metadata }: PpmpProgressProps) {
  const { ppmpTitle, progressPercent, totalItems, consolidatedItems } = metadata

  const remainingItems = totalItems - consolidatedItems

  const statusColor =
    progressPercent >= 80
      ? 'text-emerald-600 dark:text-emerald-400'
      : progressPercent >= 50
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-amber-600 dark:text-amber-400'

  return (
    <div className="mt-3 p-3 bg-muted/40 dark:bg-slate-800/55 rounded-lg border border-border/70">
      {/* PPMP Title */}
      <div className="mb-3">
        <div className="text-xs font-medium text-muted-foreground mb-1">PPMP Title</div>
        <div className="text-sm font-semibold text-foreground line-clamp-2">
          {ppmpTitle}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground">
            Consolidation Progress
          </span>
        </div>
        <div className={`text-lg font-bold tabular-nums ${statusColor}`}>
          {progressPercent.toFixed(1)}%
        </div>
      </div>

      {/* Progress Bar */}
      <Progress value={progressPercent} className="h-3 mb-3" />

      {/* Item Counts */}
      <div className="grid grid-cols-3 gap-2 text-xs tabular-nums">
        <div className="text-center p-2 bg-card rounded border border-border">
          <div className="text-lg font-bold text-foreground">{totalItems}</div>
          <div className="text-muted-foreground">Total Items</div>
        </div>
        <div className="text-center p-2 bg-card rounded border border-emerald-500/25">
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{consolidatedItems}</div>
          <div className="text-muted-foreground">Consolidated</div>
        </div>
        <div className="text-center p-2 bg-card rounded border border-amber-500/25">
          <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{remainingItems}</div>
          <div className="text-muted-foreground">Remaining</div>
        </div>
      </div>
    </div>
  )
}
