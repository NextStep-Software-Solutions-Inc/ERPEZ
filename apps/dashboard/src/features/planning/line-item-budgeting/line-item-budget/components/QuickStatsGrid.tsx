import { CheckCircle2, FileEdit, FileText, Wallet } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import { LibStats, formatBudgetAmount } from '../utils/libStatsUtils'

export const QuickStatsGrid = ({ stats }: { stats: LibStats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard
        label="Total LIBs"
        value={stats.total}
        icon={FileText}
        colorScheme="info"
      />
      <StatCard
        label="Draft"
        value={stats.draft}
        icon={FileEdit}
        colorScheme="warning"
      />
      <StatCard
        label="Approved"
        value={stats.approved}
        icon={CheckCircle2}
        colorScheme="success"
      />
      <StatCard
        label="Total Budget"
        value={`₱${formatBudgetAmount(stats.totalBudget)}`}
        icon={Wallet}
        colorScheme="secondary"
      />
    </div>
  )
}
