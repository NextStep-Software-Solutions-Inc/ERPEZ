/**
 * APR Stats Grid Component
 * Displays total items count, total amount, and other key metrics
 */

import { formatCurrencyPHP } from '@/utils/formatters'
import { Card, CardContent } from '@/components/ui/card'

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
      icon: '📦',
      bgColor: 'bg-blue-50',
    },
    {
      label: 'Consolidated Items',
      value: consolidatedCount.toString(),
      icon: '✓',
      bgColor: 'bg-green-50',
    },
    {
      label: 'Total Amount',
      value: formatCurrencyPHP(totalAmount),
      icon: '₱',
      bgColor: 'bg-purple-50',
    },
    {
      label: 'Status',
      value: approvalStatus,
      icon: '📋',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, idx) => (
        <Card key={idx} className={`${stat.bgColor} border-0`}>
          <CardContent className="pt-6">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-sm font-medium text-gray-600">
              {stat.label}
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-2">
              {stat.value}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
