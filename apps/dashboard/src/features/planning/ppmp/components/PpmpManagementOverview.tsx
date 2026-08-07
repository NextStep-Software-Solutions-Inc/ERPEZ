/**
 * PpmpManagementOverview
 * High-level budget summary for the PPMP management list page.
 */

import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { LineItemBudget, PPMP } from '../types'
import { computePpmpManagementOverview, formatCurrency } from '../lib/ppmpUtils'

interface PpmpManagementOverviewProps {
  ppmps: PPMP[]
  lineItemBudgets: LineItemBudget[]
  fiscalYear?: number
  className?: string
  statusSummary?: {
    draft: number
    pending: number
    approved: number
  }
}

function StatCard({
  label,
  value,
  sublabel,
  className,
  valueClassName,
}: {
  label: string
  value: string
  sublabel?: string
  className?: string
  valueClassName?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-white p-3 shadow-sm transition-all duration-200 hover:shadow-md',
        className,
      )}
    >
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground/80">
        {label}
      </div>
      <div className={cn('mt-1 text-base font-bold', valueClassName)}>
        {value}
      </div>
      {sublabel && (
        <div className="mt-0.5 text-[11px] font-medium text-muted-foreground/90">
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
        'rounded-md border bg-white px-3 py-2 shadow-sm',
        tone === 'warning' && 'border-amber-200 bg-amber-50/70',
        tone === 'success' && 'border-emerald-200 bg-emerald-50/70',
      )}
    >
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">
        {value}
      </div>
    </div>
  )
}

export function PpmpManagementOverview({
  ppmps,
  lineItemBudgets,
  fiscalYear,
  className,
  statusSummary,
}: PpmpManagementOverviewProps) {
  const summary = computePpmpManagementOverview(
    ppmps,
    lineItemBudgets,
    fiscalYear,
  )
  const usedPercent = summary.totalCeiling
    ? Math.min(
        100,
        Math.max(0, (summary.usedAmount / summary.totalCeiling) * 100),
      )
    : 0
  const procurablePercent = summary.totalCeiling
    ? Math.min(
        100,
        Math.max(0, (summary.procurableAmount / summary.totalCeiling) * 100),
      )
    : 0

  return (
    <Card
      className={cn(
        'overflow-hidden border-border/70 bg-gradient-to-br from-white to-slate-50 shadow-sm',
        className,
      )}
    >
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-muted-foreground">
              PPMP Management Overview
            </div>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Fund ceiling, allocation mix, and committed usage across all
              PPMPs.
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
            label="Total Fund Ceiling"
            value={formatCurrency(summary.totalCeiling)}
            sublabel="All active LIBs"
            className="border-indigo-100/80 bg-indigo-50/20 border-l-4 border-l-indigo-500"
            valueClassName="text-indigo-900 dark:text-indigo-100"
          />
          <StatCard
            label="PS Ceiling"
            value={formatCurrency(summary.psCeiling)}
            sublabel="Personnel Services"
            className="border-violet-100/80 bg-violet-50/20 border-l-4 border-l-violet-500"
            valueClassName="text-violet-900 dark:text-violet-100"
          />
          <StatCard
            label="MOOE Ceiling"
            value={formatCurrency(summary.mooeCeiling)}
            sublabel="Maintenance & Other Operating Expenses"
            className="border-amber-100/80 bg-amber-50/20 border-l-4 border-l-amber-500"
            valueClassName="text-amber-900 dark:text-amber-100"
          />
          <StatCard
            label="CO Ceiling"
            value={formatCurrency(summary.coCeiling)}
            sublabel="Capital Outlay"
            className="border-cyan-100/80 bg-cyan-50/20 border-l-4 border-l-cyan-500"
            valueClassName="text-cyan-900 dark:text-cyan-100"
          />
          <StatCard
            label="Procurable Amount"
            value={formatCurrency(summary.procurableAmount)}
            sublabel={`${procurablePercent.toFixed(0)}% of ceiling`}
            className="border-emerald-100/80 bg-emerald-50/20 border-l-4 border-l-emerald-500"
            valueClassName="text-emerald-700 dark:text-emerald-300"
          />
          <StatCard
            label="Used Amount"
            value={formatCurrency(summary.usedAmount)}
            sublabel={`${usedPercent.toFixed(0)}% committed`}
            className={cn(
              summary.remainingAmount < 0
                ? 'border-red-100/80 bg-red-50/20 border-l-4 border-l-red-500'
                : 'border-teal-100/80 bg-teal-50/20 border-l-4 border-l-teal-500',
            )}
            valueClassName={cn(
              summary.remainingAmount < 0
                ? 'text-red-700 dark:text-red-300'
                : 'text-teal-700 dark:text-teal-300',
            )}
          />
        </div>

        <div className="rounded-2xl border border-border bg-white/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              Remaining balance: {formatCurrency(summary.remainingAmount)}
            </span>
            <span>{usedPercent.toFixed(0)}% committed</span>
          </div>
          <Progress
            value={usedPercent}
            color={summary.remainingAmount < 0 ? 'destructive' : 'primary'}
            size="sm"
            className="h-3"
          />
        </div>
      </CardContent>
    </Card>
  )
}
