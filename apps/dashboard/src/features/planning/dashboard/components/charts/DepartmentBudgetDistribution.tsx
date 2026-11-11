/**
 * Department Programmed Budget vs Ceiling Component
 *
 * Displays real Programmed Budget against Approved Ceilings
 * across departments in Philippine Pesos (₱) and genuine programming rates.
 *
 * @module features/planning/dashboard/components/charts/DepartmentBudgetDistribution
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import type { DepartmentBudgetDistributionItem } from '../../types'
import { formatCurrencyPHP, formatCurrencyAbbr } from '@/utils/formatters'

interface DepartmentBudgetDistributionProps {
  data: DepartmentBudgetDistributionItem[]
  isLoading?: boolean
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-3 bg-muted/40 rounded-lg space-y-2 border border-border">
          <div className="h-4 bg-muted rounded w-1/4" />
          <div className="h-2 bg-muted rounded w-full" />
        </div>
      ))}
    </div>
  )
}

export function DepartmentBudgetDistribution({
  data,
  isLoading,
}: DepartmentBudgetDistributionProps) {
  if (isLoading) {
    return (
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Department Budget Allocation
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Programmed line-item budget vs approved ceiling (₱)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoadingSkeleton />
        </CardContent>
      </Card>
    )
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border border-border/80 shadow-xs bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-foreground">
            Department Budget Allocation
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Programmed line-item budget vs approved ceiling (₱)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="py-8 text-center text-xs text-muted-foreground font-normal">
            No department budget records encoded for this fiscal year.
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalProgrammed = data.reduce((acc, curr) => acc + curr.programmedAmount, 0)
  const totalCeiling = data.reduce((acc, curr) => acc + curr.ceilingAmount, 0)
  const overallRate = totalCeiling > 0 ? (totalProgrammed / totalCeiling) * 100 : 0

  return (
    <Card className="border border-border/80 shadow-xs bg-card">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-sm font-semibold text-foreground">
            Department Budget Allocation
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground font-normal">
            Programmed line-item budget vs allocated department ceiling
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-normal bg-muted/60 px-2.5 py-0.5 rounded border border-border tabular-nums">
            Total: <span className="font-semibold text-foreground">{formatCurrencyAbbr(totalProgrammed)}</span> / {formatCurrencyAbbr(totalCeiling)} ({overallRate.toFixed(1)}%)
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {data.map((dept) => {
            const hasCeiling = dept.hasCeilingAllocated && dept.ceilingAmount > 0
            const pct = hasCeiling ? Math.min(100, Math.max(0, dept.programmingPercentage)) : 0
            const isExceeded = hasCeiling && dept.programmedAmount > dept.ceilingAmount

            return (
              <div
                key={dept.departmentId || dept.department}
                className="p-3 bg-muted/30 dark:bg-slate-800/50 hover:bg-muted/60 dark:hover:bg-slate-800/80 rounded-lg border border-border/70 transition-colors"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <span className="font-medium text-sm text-foreground">{dept.department}</span>

                  <div className="flex items-center gap-2 text-xs tabular-nums">
                    <span className="font-semibold text-foreground">{formatCurrencyPHP(dept.programmedAmount)}</span>
                    <span className="text-muted-foreground/60">/</span>
                    {hasCeiling ? (
                      <span className="text-muted-foreground font-normal">Ceiling: {formatCurrencyPHP(dept.ceilingAmount)}</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-400 font-normal italic">No ceiling allocated</span>
                    )}

                    {!hasCeiling ? (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-medium px-1.5 py-0.5 border ${
                          dept.programmedAmount > 0
                            ? 'bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 border-amber-500/20'
                            : 'bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {dept.programmedAmount > 0 ? 'Unallocated Ceiling' : 'No Ceiling'}
                      </Badge>
                    ) : isExceeded ? (
                      <Badge
                        variant="secondary"
                        className="text-[10px] font-semibold px-1.5 py-0.5 bg-red-500/10 text-red-700 dark:bg-red-500/15 dark:text-red-300 border border-red-500/20 flex items-center gap-1"
                      >
                        <AlertTriangle className="h-3 w-3" />
                        {dept.programmingPercentage.toFixed(1)}% (Over-Budget)
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className={`text-[10px] font-semibold px-1.5 py-0.5 border ${
                          pct >= 90
                            ? 'bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 border-emerald-500/20'
                            : 'bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 border-blue-500/20'
                        }`}
                      >
                        {dept.programmingPercentage.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                </div>

                {hasCeiling ? (
                  <Progress
                    value={pct}
                    className={`h-1.5 bg-slate-200/70 dark:bg-slate-700/70 ${isExceeded ? '[&>div]:bg-red-500' : pct >= 90 ? '[&>div]:bg-emerald-500' : '[&>div]:bg-blue-500'}`}
                  />
                ) : (
                  <div className="h-1.5 w-full bg-slate-200/70 dark:bg-slate-700/70 rounded-full overflow-hidden">
                    {dept.programmedAmount > 0 && (
                      <div className="h-full bg-amber-400/60 w-full" />
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
