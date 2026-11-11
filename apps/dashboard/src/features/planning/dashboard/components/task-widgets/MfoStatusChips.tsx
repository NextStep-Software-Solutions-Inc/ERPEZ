/**
 * MFO Status Chips Widget
 * 
 * Displays status chips showing MFO output counts
 * (Completed, Ongoing, Delayed) for Strategy-related tasks.
 * 
 * @module features/planning/dashboard/components/task-widgets/MfoStatusChips
 */

import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import type { StrategyTaskMetadata } from '../../types'

interface MfoStatusChipsProps {
  metadata: StrategyTaskMetadata
}

export function MfoStatusChips({ metadata }: MfoStatusChipsProps) {
  const { mfoName, status, completedCount, ongoingCount, delayedCount } = metadata

  const totalOutputs = completedCount + ongoingCount + delayedCount

  // Overall status styling
  const statusConfig = {
    completed: { color: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/25', label: 'On Track' },
    ongoing: { color: 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-500/25', label: 'In Progress' },
    delayed: { color: 'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/25', label: 'Delayed' },
  }

  const currentStatus = statusConfig[status]

  return (
    <div className="mt-3 p-3 bg-muted/40 dark:bg-slate-800/55 rounded-lg border border-border/70">
      {/* MFO Name */}
      <div className="mb-2">
        <div className="text-xs font-medium text-muted-foreground">MFO Reference</div>
        <div className="text-sm font-semibold text-foreground truncate">{mfoName}</div>
      </div>

      {/* Overall Status Badge */}
      <div className="mb-3">
        <Badge
          variant="outline"
          className={`${currentStatus.color} border`}
        >
          {currentStatus.label}
        </Badge>
      </div>

      {/* Status Breakdown */}
      <div className="grid grid-cols-3 gap-2">
        {/* Completed */}
        <div className="flex flex-col items-center p-2 bg-card rounded border border-emerald-500/25">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mb-1" />
          <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{completedCount}</div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>

        {/* Ongoing */}
        <div className="flex flex-col items-center p-2 bg-card rounded border border-blue-500/25">
          <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400 mb-1" />
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400 tabular-nums">{ongoingCount}</div>
          <div className="text-xs text-muted-foreground">Ongoing</div>
        </div>

        {/* Delayed */}
        <div className="flex flex-col items-center p-2 bg-card rounded border border-red-500/25">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 mb-1" />
          <div className="text-lg font-bold text-red-600 dark:text-red-400 tabular-nums">{delayedCount}</div>
          <div className="text-xs text-muted-foreground">Delayed</div>
        </div>
      </div>

      {/* Total */}
      <div className="mt-2 text-xs text-center text-muted-foreground tabular-nums">
        Total Outputs: <span className="font-semibold text-foreground">{totalOutputs}</span>
      </div>
    </div>
  )
}
