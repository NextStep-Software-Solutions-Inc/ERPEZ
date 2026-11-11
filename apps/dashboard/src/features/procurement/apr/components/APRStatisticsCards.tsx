/**
 * APR Statistics Card Component
 * Displays APR statistics for admin dashboard
 */

import { CheckCircle, Clock, AlertCircle, DollarSign, FileText } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import type { APRStatistics } from '../types/adminTypes'

interface APRStatisticsCardProps {
  statistics: APRStatistics
}

export function APRStatisticsCards({ statistics }: APRStatisticsCardProps) {
  const approvedCount =
    statistics.statisticsByStatus['APPROVED'] ??
    statistics.statisticsByStatus['Approved'] ??
    statistics.totalApproved

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Submitted"
        value={statistics.totalSubmitted}
        icon={FileText}
        colorScheme="info"
        details={`${statistics.totalDraft} in draft`}
      />

      <StatCard
        label="Pending Approval"
        value={statistics.totalPending}
        icon={Clock}
        colorScheme="warning"
        details="Awaiting review"
      />

      <StatCard
        label="Approved"
        value={statistics.totalApproved}
        icon={CheckCircle}
        colorScheme="success"
        details={`${approvedCount} total approved`}
      />

      <StatCard
        label="Returned"
        value={statistics.totalReturned}
        icon={AlertCircle}
        colorScheme="danger"
        details="Needs revision"
      />

      <StatCard
        label="Total Budget Approved"
        value={`₱${new Intl.NumberFormat('en-PH').format(statistics.totalBudgetApproved)}`}
        icon={DollarSign}
        colorScheme="secondary"
        details={`₱${new Intl.NumberFormat('en-PH').format(statistics.totalBudgetRequested)} requested`}
      />
    </div>
  )
}
