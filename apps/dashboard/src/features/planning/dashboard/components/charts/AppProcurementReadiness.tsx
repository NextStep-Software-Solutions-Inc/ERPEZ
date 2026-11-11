/**
 * APP Procurement Readiness by Stage
 *
 * Displays Annual Procurement Plan readiness across 4 standard stages (RA 9184)
 * laid out in a 4-column card grid:
 *   Stage 1 — Mode of proc.
 *   Stage 2 — Item encoding & budget
 *   Stage 3 — Procurement schedules
 *   Stage 4 — Early procurement activity (EPA)
 *
 * Each card features a colored header strip, prominent percentage value,
 * thin progress track, completed/total item count, and status badge.
 *
 * @module features/planning/dashboard/components/charts/AppProcurementReadiness
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { CheckCircle2, AlertTriangle, Clock, Layers } from 'lucide-react'
import type { AppProcurementReadinessData } from '../../types'
import { formatCurrencyPHP } from '@/utils/formatters'

interface AppProcurementReadinessProps {
  data: AppProcurementReadinessData | null
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="w-full h-[320px] flex flex-col justify-center gap-3 p-4 bg-muted/30 animate-pulse rounded-lg">
      <div className="h-4 bg-muted rounded w-1/4" />
      <div className="grid grid-cols-2 2xl:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-muted rounded-lg" />
        ))}
      </div>
      <div className="h-20 bg-muted rounded" />
    </div>
  )
}

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  'on-track': {
    label: 'On Track',
    badgeClass: 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/20',
  },
  'warning': {
    label: 'Action Needed',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/20',
  },
  'critical': {
    label: 'Incomplete',
    badgeClass: 'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/20',
  },
  'below-target': {
    label: 'Incomplete',
    badgeClass: 'bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border-red-500/20',
  },
  'at-risk': {
    label: 'At Risk',
    badgeClass: 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/20',
  },
}

export function AppProcurementReadiness({
  data,
  isLoading,
}: AppProcurementReadinessProps) {
  if (isLoading || !data) {
    return (
      <Card className="h-full border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">APP Procurement Readiness</CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">Stage-by-stage procurement planning overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const totalItems = data.totalItems ?? 0
  const status = statusConfig[data.overallStatus] || statusConfig['warning']
  const hasItems = totalItems > 0

  return (
    <Card className="h-full flex flex-col justify-between border border-border/80 shadow-xs bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground">
              APP Procurement Readiness
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              Planning readiness across 4 procurement stages (RA 9184)
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className={`px-2 py-0.5 rounded font-semibold border text-[11px] ${status.badgeClass}`}>
              {status.label}
            </span>
            <span className="text-muted-foreground font-medium bg-muted/60 px-2 py-0.5 rounded border border-border text-[11px] tabular-nums">
              {totalItems} Total APP Items
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 pb-4">
        {!hasItems ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-border rounded-lg bg-muted/30">
            <Layers className="h-6 w-6 text-muted-foreground/60 mb-1.5" />
            <p className="text-xs font-medium text-foreground">No APP items encoded for this fiscal year</p>
            <p className="text-[11px] text-muted-foreground font-normal mt-0.5">
              Items will appear once encoded or consolidated from department PPMPs.
            </p>
          </div>
        ) : (
          <>
            {/* ── 4 Stage Cards (2x2 on standard laptops, 4-col on ultra-wide) ─── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 2xl:grid-cols-4 gap-3">
              {data.stages.map((stage) => {
                const completed = stage.completedCount ?? 0
                const stageTotal = stage.totalCount > 0 ? stage.totalCount : totalItems
                const pct = stage.percent ?? (stageTotal > 0 ? (completed / stageTotal) * 100 : 0)
                const isActionNeeded = stage.status === 'action-needed' || (stageTotal > 0 && completed < stageTotal && pct < 100)
                const isComplete = stageTotal > 0 && completed === stageTotal
                const pendingCount = stageTotal - completed

                const headerColor = isComplete
                  ? '#1baf7a' // green
                  : isActionNeeded
                    ? '#eda100' // amber
                    : '#2a78d6' // blue

                return (
                  <div
                    key={stage.label}
                    className="relative overflow-hidden rounded-lg border border-border/70 bg-muted/30 dark:bg-slate-800/50 p-3 shadow-2xs hover:border-border transition-all flex flex-col justify-between"
                  >
                    {/* Top colored accent strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: headerColor }}
                    />

                    <div>
                      {/* Stage Label */}
                      <p className="text-[11px] font-medium text-muted-foreground truncate mt-0.5 mb-1.5" title={stage.label}>
                        {stage.label}
                      </p>

                      {/* Percentage + Status Badge */}
                      <div className="flex items-center justify-between gap-1.5 flex-wrap">
                        <span className="text-xl font-bold text-foreground tabular-nums leading-tight">
                          {pct.toFixed(pct % 1 === 0 ? 0 : 1)}%
                        </span>

                        {/* Status Badge */}
                        {isComplete ? (
                          <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 px-1.5 py-0.5 rounded border border-emerald-500/20 flex items-center gap-0.5 shrink-0">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Ready
                          </span>
                        ) : isActionNeeded ? (
                          <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 px-1.5 py-0.5 rounded border border-amber-500/20 flex items-center gap-0.5 shrink-0 tabular-nums">
                            <AlertTriangle className="h-2.5 w-2.5" /> {pendingCount} pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-500/10 dark:bg-blue-500/15 px-1.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-0.5 shrink-0">
                            <Clock className="h-2.5 w-2.5" /> In progress
                          </span>
                        )}
                      </div>

                      {/* Thin Progress Track */}
                      <div className="my-2.5">
                        <Progress
                          value={pct}
                          className={`h-1.5 bg-slate-200/70 dark:bg-slate-700/70 ${isComplete ? '[&>div]:bg-emerald-500' : isActionNeeded ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
                        />
                      </div>
                    </div>

                    {/* Completed / Total item fraction */}
                    <div className="text-[11px] text-muted-foreground font-normal pt-1.5 border-t border-border/50 flex items-center justify-between tabular-nums">
                      <span>Items:</span>
                      <span className="font-semibold text-foreground">
                        {completed} / {stageTotal}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── By Procurement Mode (RA 9184) ────────────────────────── */}
            {data.byMode && data.byMode.length > 0 && (
              <div className="pt-2.5 border-t border-border/60">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  By Procurement Mode (RA 9184)
                </p>
                <div className={`grid grid-cols-1 gap-2.5 ${data.byMode.slice(0, 4).length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 2xl:grid-cols-4'}`}>
                  {data.byMode.slice(0, 4).map((mode) => (
                    <div
                      key={mode.mode}
                      className="rounded-lg p-2.5 border border-border/70 bg-muted/30 dark:bg-slate-800/50 hover:bg-muted/60 dark:hover:bg-slate-800/80 transition-colors"
                    >
                      <p className="text-[11px] font-semibold text-foreground truncate mb-1" title={mode.mode}>
                        {mode.mode}
                      </p>
                      <div className="flex items-center justify-between text-xs tabular-nums">
                        <span className="font-semibold text-foreground/90">{mode.count} items</span>
                        <span className="text-muted-foreground font-normal text-[11px]">
                          {mode.percent.toFixed(1)}%
                        </span>
                      </div>
                      {mode.totalAmount > 0 && (
                        <p className="text-[10px] text-muted-foreground mt-0.5 truncate font-normal tabular-nums">
                          {formatCurrencyPHP(mode.totalAmount)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
