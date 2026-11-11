/**
 * APR Stats Grid Component
 * Matches the updated multi-accent 4-card metric strip
 */

import { formatCurrencyPHP } from '@/utils/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Layers, DollarSign, Activity } from 'lucide-react'

interface APRStatsGridProps {
  totalItemsCount: number
  totalAmount: number
  consolidatedCount: number
  approvalStatus: string
  isReviewer?: boolean
}

function getFormattedStatus(status: string, isReviewer?: boolean): string {
  const s = String(status || 'Draft').toUpperCase().replace(/[\s-_]/g, '')
  if (s === 'FORAPPROVAL' || s === 'SUBMITTED') {
    return isReviewer ? 'For Approval' : 'Submitted'
  }
  if (s === 'DRAFT') return 'Draft'
  if (s === 'RETURNED') return 'Returned'
  if (s === 'APPROVED') return 'Approved'
  if (s === 'PARTIALLYAVAILABLE') return 'Partially Available'
  if (s === 'OUTOFSTOCK') return 'Out of Stock'
  return status || 'Draft'
}

export function APRStatsGrid({
  totalItemsCount,
  totalAmount,
  consolidatedCount,
  approvalStatus,
  isReviewer = false,
}: APRStatsGridProps) {
  const displayStatus = getFormattedStatus(approvalStatus, isReviewer)

  const stats = [
    {
      label: 'TOTAL ITEMS',
      value: totalItemsCount.toString(),
      icon: Package,
      labelColor: 'text-slate-500 dark:text-slate-400',
      valueColor: 'text-slate-900 dark:text-slate-50',
      cardBorder: 'border-border hover:border-blue-300 dark:hover:border-blue-500/40',
      iconBox: 'bg-blue-50 text-blue-600 border border-blue-200/80 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30',
      topAccent: '',
    },
    {
      label: 'CONSOLIDATED ITEMS',
      value: consolidatedCount.toString(),
      icon: Layers,
      labelColor: 'text-emerald-700 dark:text-emerald-400',
      valueColor: 'text-slate-900 dark:text-slate-50',
      cardBorder: 'border-border hover:border-emerald-300 dark:hover:border-emerald-500/40',
      iconBox: 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30',
      topAccent: 'border-l-2 border-l-emerald-500',
    },
    {
      label: 'TOTAL AMOUNT',
      value: formatCurrencyPHP(totalAmount),
      icon: DollarSign,
      labelColor: 'text-indigo-700 dark:text-indigo-400',
      valueColor: 'text-indigo-600 dark:text-indigo-400',
      cardBorder: 'border-border hover:border-indigo-300 dark:hover:border-indigo-500/40',
      iconBox: 'bg-indigo-50 text-indigo-600 border border-indigo-200/80 dark:bg-indigo-500/15 dark:text-indigo-400 dark:border-indigo-500/30',
      topAccent: '',
    },
    {
      label: 'STATUS',
      value: displayStatus,
      icon: Activity,
      labelColor: 'text-amber-700 dark:text-amber-400',
      valueColor: 'text-slate-900 dark:text-slate-50',
      cardBorder: 'border-border hover:border-amber-300 dark:hover:border-amber-500/40',
      iconBox: 'bg-amber-50 text-amber-600 border border-amber-200/80 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30',
      topAccent: '',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card
            key={idx}
            className={`bg-card text-card-foreground border ${stat.cardBorder} ${stat.topAccent} rounded-2xl shadow-2xs p-0 transition-all hover:shadow-xs`}
          >
            <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${stat.labelColor}`}>
                  {stat.label}
                </p>
                <p className={`text-lg sm:text-xl font-bold tracking-tight truncate tabular-nums ${stat.valueColor}`}>
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex-shrink-0 h-10 w-10 sm:h-11 sm:w-11 rounded-xl flex items-center justify-center ${stat.iconBox}`}
              >
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
