/**
 * Planning Dashboard — Actionable "Requires Attention" Component
 *
 * Displays a curated list of operational planning items that need user action,
 * derived exclusively from real database metrics, styled with calm government ERP visual language.
 *
 * @module features/planning/dashboard/components/PlanningAttentionRequired
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import type { AttentionItem } from '../types'

interface PlanningAttentionRequiredProps {
  items: AttentionItem[]
  fiscalYear: number
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse p-4">
      <div className="h-4 bg-muted rounded w-1/4" />
      <div className="h-12 bg-muted rounded-lg" />
      <div className="h-12 bg-muted rounded-lg" />
    </div>
  )
}

export function PlanningAttentionRequired({
  items,
  fiscalYear,
  isLoading,
}: PlanningAttentionRequiredProps) {
  if (isLoading) {
    return (
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">Operational Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const hasItems = items.length > 0

  return (
    <Card className="border border-border/80 shadow-xs bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              Operational Attention Required
              {hasItems ? (
                <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 px-2 py-0.5 rounded">
                  {items.length} Action{items.length > 1 ? 's' : ''} Needed
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 px-2 py-0.5 rounded">
                  All On Track
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground font-normal">
              {hasItems
                ? `Operational bottlenecks and pending deliverables identified for FY ${fiscalYear}`
                : `All planning deliverables, ceilings, and procurement workflows are on track for FY ${fiscalYear}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {!hasItems ? (
          <div className="flex items-center gap-3 p-3.5 bg-emerald-500/[0.06] dark:bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-emerald-950 dark:text-emerald-200">
                All planning modules and schedules are on track
              </p>
              <p className="text-[11px] text-emerald-700 dark:text-emerald-300/90 mt-0.5 font-normal">
                Department budgets are within authorized limits, OPCRs are submitted, and procurement items have scheduled dates.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {items.map((item) => {
              const isCritical = item.severity === 'critical'
              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between transition-colors ${
                    isCritical
                      ? 'bg-red-500/[0.03] dark:bg-red-500/[0.07] border-red-200/80 dark:border-red-500/25 hover:bg-red-500/[0.06] dark:hover:bg-red-500/[0.11]'
                      : 'bg-amber-500/[0.03] dark:bg-amber-500/[0.07] border-amber-200/80 dark:border-amber-500/25 hover:bg-amber-500/[0.06] dark:hover:bg-amber-500/[0.11]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded border ${
                        isCritical
                          ? 'text-red-700 dark:text-red-300 bg-red-500/10 dark:bg-red-500/20 border-red-500/20'
                          : 'text-amber-700 dark:text-amber-300 bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/20'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[11px] text-muted-foreground font-medium tabular-nums">
                        {item.count} {item.count === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-foreground leading-snug mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.actionText && (
                    <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-end text-[11px]">
                      <span className={`font-semibold flex items-center gap-1 hover:underline cursor-pointer ${
                        isCritical
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-amber-700 dark:text-amber-400'
                      }`}>
                        {item.actionText} <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
