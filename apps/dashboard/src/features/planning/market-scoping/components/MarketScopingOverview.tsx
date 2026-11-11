/**
 * Market Scoping Overview
 * High-level summary for the Market Scoping dashboard
 * Follows PPMP design pattern for consistency
 */

import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { MarketScopingForm } from '../types/marketScopingTypes'

interface MarketScopingOverviewProps {
  forms: MarketScopingForm[]
  statusSummary?: {
    draft: number
    pending: number
    approved: number
  }
  className?: string
}

function StatCard({
  label,
  value,
  sublabel,
  valueClassName,
}: {
  label: string
  value: string | number
  sublabel?: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-3 shadow-2xs">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className={cn('mt-1 text-sm font-semibold tabular-nums', valueClassName)}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-0.5 text-[11px] text-muted-foreground">
          {sublabel}
        </div>
      )}
    </div>
  )
}

function MiniMetricCard({
  label,
  value,
  tone = 'default',
}: {
  label: string
  value: string | number
  tone?: 'default' | 'warning' | 'success'
}) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-secondary/40 px-3 py-2 shadow-2xs',
        tone === 'warning' && 'border-amber-500/25 bg-amber-500/10 dark:border-amber-500/30 dark:bg-amber-500/15',
        tone === 'success' && 'border-emerald-500/25 bg-emerald-500/10 dark:border-emerald-500/30 dark:bg-emerald-500/15',
      )}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground tabular-nums">
        {value}
      </div>
    </div>
  )
}

export function MarketScopingOverview({
  forms,
  statusSummary,
  className,
}: MarketScopingOverviewProps) {
  const totalBudget = forms.reduce(
    (sum, form) => sum + (form.estimatedBudget || 0),
    0,
  )
  const approvedBudget = forms
    .filter((f) => f.status === 'Approved')
    .reduce((sum, form) => sum + (form.estimatedBudget || 0), 0)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value)
  }

  return (
    <Card
      className={cn(
        'overflow-hidden border border-border/80 bg-card shadow-xs',
        className,
      )}
    >
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              Market Scoping Overview
            </div>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Track all market scoping forms and their approval status
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <MiniMetricCard label="Draft" value={statusSummary?.draft ?? 0} />
            <MiniMetricCard
              label="Pending"
              value={statusSummary?.pending ?? 0}
              tone="warning"
            />
            <MiniMetricCard
              label="Approved"
              value={statusSummary?.approved ?? 0}
              tone="success"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <StatCard
            label="Total Forms"
            value={forms.length}
            sublabel="All submitted forms"
            valueClassName="text-foreground"
          />
          <StatCard
            label="Total Budget"
            value={formatCurrency(totalBudget)}
            sublabel="All forms combined"
            valueClassName="text-foreground"
          />
          <StatCard
            label="Approved Budget"
            value={formatCurrency(approvedBudget)}
            sublabel="Ready for procurement"
            valueClassName="text-emerald-600 dark:text-emerald-400"
          />
        </div>
      </CardContent>
    </Card>
  )
}
