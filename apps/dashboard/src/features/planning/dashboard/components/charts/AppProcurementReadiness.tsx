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
    <div className="w-full h-[320px] flex flex-col justify-center gap-3 p-4 bg-gray-50/50 animate-pulse rounded-lg">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 rounded-lg" />
        ))}
      </div>
      <div className="h-20 bg-gray-200 rounded" />
    </div>
  )
}

const statusConfig: Record<string, { label: string; badgeClass: string }> = {
  'on-track': { label: 'On Track', badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  'warning': { label: 'Action Needed', badgeClass: 'bg-amber-50 text-amber-700 border-amber-100' },
  'critical': { label: 'Incomplete', badgeClass: 'bg-red-50 text-red-700 border-red-100' },
  'below-target': { label: 'Incomplete', badgeClass: 'bg-red-50 text-red-700 border-red-100' },
  'at-risk': { label: 'At Risk', badgeClass: 'bg-amber-50 text-amber-700 border-amber-100' },
}

export function AppProcurementReadiness({
  data,
  isLoading,
}: AppProcurementReadinessProps) {
  if (isLoading || !data) {
    return (
      <Card className="h-full border border-gray-100 shadow-sm bg-white">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">APP Procurement Readiness</CardTitle>
          <CardDescription className="text-xs text-gray-500 font-normal">Stage-by-stage procurement planning overview</CardDescription>
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
    <Card className="h-full flex flex-col justify-between border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900">
              APP Procurement Readiness
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 font-normal">
              Planning readiness across 4 procurement stages (RA 9184)
            </CardDescription>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className={`px-2 py-0.5 rounded font-medium border text-[11px] ${status.badgeClass}`}>
              {status.label}
            </span>
            <span className="text-gray-500 font-normal bg-gray-50 px-2 py-0.5 rounded border border-gray-100 text-[11px]">
              {totalItems} Total APP Items
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-1 pb-4">
        {!hasItems ? (
          <div className="h-[240px] flex flex-col items-center justify-center text-center p-4 border border-dashed border-gray-200 rounded-lg bg-gray-50/40">
            <Layers className="h-6 w-6 text-gray-300 mb-1.5" />
            <p className="text-xs font-medium text-gray-600">No APP items encoded for this fiscal year</p>
            <p className="text-[11px] text-gray-400 font-normal mt-0.5">
              Items will appear once encoded or consolidated from department PPMPs.
            </p>
          </div>
        ) : (
          <>
            {/* ── 4 Stage Cards in a 4-Column Grid ─────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
                    className="relative overflow-hidden rounded-lg border border-gray-100 bg-white p-3 shadow-sm hover:shadow transition-all flex flex-col justify-between"
                  >
                    {/* Top colored accent strip */}
                    <div
                      className="absolute top-0 left-0 right-0 h-1"
                      style={{ backgroundColor: headerColor }}
                    />

                    <div>
                      {/* Stage Label */}
                      <p className="text-[11px] font-medium text-gray-600 truncate mt-0.5 mb-1" title={stage.label}>
                        {stage.label}
                      </p>

                      {/* Percentage */}
                      <div className="flex items-baseline justify-between gap-1">
                        <span className="text-xl font-bold text-gray-900 leading-tight">
                          {pct.toFixed(pct % 1 === 0 ? 0 : 1)}%
                        </span>

                        {/* Status Badge */}
                        {isComplete ? (
                          <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 flex items-center gap-0.5">
                            <CheckCircle2 className="h-2.5 w-2.5" /> Ready
                          </span>
                        ) : isActionNeeded ? (
                          <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200 flex items-center gap-0.5">
                            <AlertTriangle className="h-2.5 w-2.5" /> {pendingCount} pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200 flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" /> In progress
                          </span>
                        )}
                      </div>

                      {/* Thin Progress Track */}
                      <div className="my-2">
                        <Progress
                          value={pct}
                          className={`h-1.5 ${isComplete ? '[&>div]:bg-emerald-500' : isActionNeeded ? '[&>div]:bg-amber-500' : '[&>div]:bg-blue-500'}`}
                        />
                      </div>
                    </div>

                    {/* Completed / Total item fraction */}
                    <div className="text-[11px] text-gray-500 font-normal pt-1 border-t border-gray-50 flex items-center justify-between">
                      <span>Items:</span>
                      <span className="font-semibold text-gray-800">
                        {completed} / {stageTotal}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* ── By Procurement Mode (RA 9184) ────────────────────────── */}
            {data.byMode && data.byMode.length > 0 && (
              <div className="pt-2 border-t border-gray-100">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  By Procurement Mode (RA 9184)
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {data.byMode.slice(0, 4).map((mode) => (
                    <div
                      key={mode.mode}
                      className="rounded-lg p-2 border border-gray-100 bg-white hover:bg-gray-50/50 transition-colors"
                    >
                      <p className="text-[11px] font-medium text-gray-700 truncate mb-0.5" title={mode.mode}>
                        {mode.mode}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-gray-800">{mode.count} items</span>
                        <span className="text-gray-500 font-normal text-[11px]">
                          {mode.percent.toFixed(1)}%
                        </span>
                      </div>
                      {mode.totalAmount > 0 && (
                        <p className="text-[10px] text-gray-400 mt-0.5 truncate font-normal">
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
