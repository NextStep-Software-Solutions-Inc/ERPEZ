/**
 * ImpactSummary
 * Displays the aggregate effect of a bulk price adjustment.
 */

import type { AdjustmentPreview } from '../types'

function formatPrice(n: number) {
  return `₱${Math.abs(n).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

interface ImpactSummaryProps {
  preview: AdjustmentPreview
}

export function ImpactSummary({ preview }: ImpactSummaryProps) {
  const isIncrease = preview.totalDelta >= 0

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-muted/50 border p-3 space-y-0.5">
        <p className="text-xs text-muted-foreground">Items affected</p>
        <p className="text-2xl font-semibold tabular-nums">
          {preview.totalAffected.toLocaleString()}
        </p>
      </div>
      <div
        className={`rounded-lg border p-3 space-y-0.5 ${
          isIncrease
            ? 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800'
            : 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800'
        }`}
      >
        <p className="text-xs text-muted-foreground">Total price change</p>
        <p
          className={`text-2xl font-semibold tabular-nums ${isIncrease ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
        >
          {isIncrease ? '+' : '-'}
          {formatPrice(preview.totalDelta)}
        </p>
      </div>
    </div>
  )
}
