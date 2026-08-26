/**
 * Planning Dashboard — Actionable "Requires Attention" Component
 *
 * Displays a curated list of operational planning items that need user action,
 * derived exclusively from real database metrics, styled with calm government ERP visual language.
 *
 * @module features/planning/dashboard/components/PlanningAttentionRequired
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react'
import type { AttentionItem } from '../types'

interface PlanningAttentionRequiredProps {
  items: AttentionItem[]
  fiscalYear: number
  isLoading?: boolean
}

function Skeleton() {
  return (
    <div className="space-y-3 animate-pulse p-4">
      <div className="h-4 bg-gray-200 rounded w-1/4" />
      <div className="h-12 bg-gray-200 rounded-lg" />
      <div className="h-12 bg-gray-200 rounded-lg" />
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
      <Card className="border border-gray-100 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-gray-900">Operational Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton />
        </CardContent>
      </Card>
    )
  }

  const hasItems = items.length > 0

  return (
    <Card className="border border-gray-100 shadow-sm bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              Operational Attention Required
              {hasItems ? (
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded">
                  {items.length} Action{items.length > 1 ? 's' : ''} Needed
                </span>
              ) : (
                <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded">
                  All On Track
                </span>
              )}
            </CardTitle>
            <CardDescription className="text-xs text-gray-500 font-normal">
              {hasItems
                ? `Operational bottlenecks and pending deliverables identified for FY ${fiscalYear}`
                : `All planning deliverables, ceilings, and procurement workflows are on track for FY ${fiscalYear}`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 pb-4">
        {!hasItems ? (
          <div className="flex items-center gap-3 p-3 bg-emerald-50/40 rounded-lg border border-emerald-100/70">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-medium text-emerald-950">
                All planning modules and schedules are on track
              </p>
              <p className="text-[11px] text-emerald-700/90 mt-0.5 font-normal">
                Department budgets are within authorized limits, OPCRs are submitted, and procurement items have scheduled dates.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {items.map((item) => {
              const isCritical = item.severity === 'critical'
              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-lg border flex flex-col justify-between transition-colors ${
                    isCritical
                      ? 'bg-white border-red-100 hover:bg-red-50/20'
                      : 'bg-white border-amber-100 hover:bg-amber-50/20'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-medium uppercase tracking-wider px-1.5 py-0.2 rounded border ${
                        isCritical
                          ? 'text-red-700 bg-red-50 border-red-200/60'
                          : 'text-amber-700 bg-amber-50 border-amber-200/60'
                      }`}>
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        {item.count} {item.count === 1 ? 'item' : 'items'}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-gray-900 leading-snug mb-1">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-normal leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.actionText && (
                    <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-end text-[11px]">
                      <span className={`font-medium flex items-center gap-1 hover:underline cursor-pointer ${
                        isCritical ? 'text-red-700' : 'text-amber-800'
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
