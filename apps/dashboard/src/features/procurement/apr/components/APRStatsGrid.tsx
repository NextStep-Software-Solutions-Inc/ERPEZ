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
      labelColor: 'text-slate-500',
      valueColor: 'text-gray-900',
      cardBorder: 'border-slate-100 hover:border-blue-100',
      iconBox: 'bg-[#f0f7ff] text-[#2563eb] border border-[#dbeafe]',
      topAccent: '',
    },
    {
      label: 'CONSOLIDATED ITEMS',
      value: consolidatedCount.toString(),
      icon: Layers,
      labelColor: 'text-emerald-700',
      valueColor: 'text-gray-900',
      cardBorder: 'border-slate-100 hover:border-emerald-100',
      iconBox: 'bg-[#ecfdf5] text-[#059669] border border-[#d1fae5]',
      topAccent: 'border-l-2 border-l-emerald-500',
    },
    {
      label: 'TOTAL AMOUNT',
      value: formatCurrencyPHP(totalAmount),
      icon: DollarSign,
      labelColor: 'text-indigo-700',
      valueColor: 'text-[#6366f1]',
      cardBorder: 'border-slate-100 hover:border-purple-100',
      iconBox: 'bg-[#f5f3ff] text-[#6366f1] border border-[#ede9fe]',
      topAccent: '',
    },
    {
      label: 'STATUS',
      value: displayStatus,
      icon: Activity,
      labelColor: 'text-amber-700',
      valueColor: 'text-gray-900',
      cardBorder: 'border-slate-100 hover:border-amber-100',
      iconBox: 'bg-[#fffbeb] text-[#d97706] border border-[#fef3c7]',
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
            className={`bg-white border ${stat.cardBorder} ${stat.topAccent} rounded-2xl shadow-2xs p-0 transition-all hover:shadow-xs`}
          >
            <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${stat.labelColor}`}>
                  {stat.label}
                </p>
                <p className={`text-lg sm:text-xl font-bold tracking-tight truncate ${stat.valueColor}`}>
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
