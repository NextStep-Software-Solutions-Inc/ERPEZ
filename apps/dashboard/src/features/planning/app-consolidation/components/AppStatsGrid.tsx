import { Calendar, Package, Hash, Wallet } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import type { AppMaster } from '../types'

interface AppStatsGridProps {
  app: AppMaster
  itemCount: number
  totalQuantity: number
}

export function AppStatsGrid({ app, itemCount, totalQuantity }: AppStatsGridProps) {
  const totalBudgetAmount = app.aggregationResults?.totalAmount ?? app.bac?.totalBudget ?? 0
  const formattedBudget = totalBudgetAmount >= 1000000
    ? `₱${(totalBudgetAmount / 1000000).toFixed(2)}M`
    : `₱${totalBudgetAmount.toLocaleString('en-PH', { maximumFractionDigits: 0 })}`

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Fiscal Year"
        value={`FY ${app.fiscalYear}`}
        icon={Calendar}
        colorScheme="info"
      />
      <StatCard
        label="Total Items"
        value={itemCount}
        icon={Package}
        colorScheme="secondary"
      />
      <StatCard
        label="Total Quantity"
        value={totalQuantity}
        icon={Hash}
        colorScheme="warning"
      />
      <StatCard
        label="Total Budget"
        value={formattedBudget}
        icon={Wallet}
        colorScheme="success"
      />
    </div>
  )
}
