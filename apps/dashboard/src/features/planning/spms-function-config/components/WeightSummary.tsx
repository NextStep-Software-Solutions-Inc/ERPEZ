import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface WeightSummaryProps {
  label: string
  icon: ReactNode
  min: number
  max?: number | null
  colorClass: string
}

export function WeightSummary({
  label,
  icon,
  min,
  max,
  colorClass,
}: WeightSummaryProps) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3 flex flex-col items-center justify-center text-center transition-all hover:bg-slate-50 dark:hover:bg-slate-800/50',
        colorClass,
      )}
    >
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-muted-foreground">{icon}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="text-sm font-bold text-default-900">
        {min}%{' '}
        <span className="text-[10px] text-muted-foreground mx-0.5 font-medium">
          to
        </span>{' '}
        {max ?? '100'}%
      </div>
    </div>
  )
}
