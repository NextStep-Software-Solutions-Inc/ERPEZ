/**
 * APR Stats Grid Component
 * Compact high-density stats strip with primary Total Amount metric
 */

import { formatCurrencyPHP } from '@/utils/formatters'
import { Card, CardContent } from '@/components/ui/card'
import { Package, Layers, DollarSign, Activity } from 'lucide-react'

interface APRStatsGridProps {
  totalItemsCount: number
  totalAmount: number
  consolidatedCount: number
  approvalStatus: string
}

export function APRStatsGrid({
  totalItemsCount,
  totalAmount,
  consolidatedCount,
  approvalStatus,
}: APRStatsGridProps) {
  const stats = [
    {
      label: 'Total Items',
      value: totalItemsCount.toString(),
      icon: Package,
      highlight: false,
    },
    {
      label: 'Consolidated Items',
      value: consolidatedCount.toString(),
      icon: Layers,
      highlight: false,
    },
    {
      label: 'Total Amount',
      value: formatCurrencyPHP(totalAmount),
      icon: DollarSign,
      highlight: true,
    },
    {
      label: 'Status',
      value: approvalStatus || 'Draft',
      icon: Activity,
      highlight: false,
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card
            key={idx}
            className={`border shadow-xs transition-all ${
              stat.highlight
                ? 'bg-gradient-to-br from-white to-blue-50/40 border-blue-200/80 ring-1 ring-blue-500/10'
                : 'bg-white border-gray-200/80'
            }`}
          >
            <CardContent className="p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-0.5">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider truncate">
                  {stat.label}
                </p>
                <p
                  className={`text-base font-bold truncate ${
                    stat.highlight ? 'text-primary font-mono tracking-tight' : 'text-gray-900'
                  }`}
                >
                  {stat.value}
                </p>
              </div>
              <div
                className={`flex-shrink-0 h-8 w-8 rounded-lg flex items-center justify-center ${
                  stat.highlight
                    ? 'bg-primary/10 text-primary'
                    : 'bg-slate-100 text-gray-600'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
