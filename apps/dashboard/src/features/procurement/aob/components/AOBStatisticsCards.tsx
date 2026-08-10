/**
 * AOB Statistics Cards Component
 * Displays AOB statistics for admin dashboard with color coding
 */

import { CheckCircle, Clock, XCircle, Trash2, FileText, Award } from 'lucide-react'
import { StatCard } from '@/components/StatCard'
import type { AOBStatistics } from '../types'

interface AOBStatisticsCardsProps {
  statistics: AOBStatistics
}

export function AOBStatisticsCards({ statistics }: AOBStatisticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
      <StatCard
        label="Total Submitted"
        value={statistics.totalSubmitted}
        icon={FileText}
        details={`${statistics.totalDraft} in draft`}
        colorScheme="info"
      />

      <StatCard
        label="Pending Approval"
        value={statistics.totalPending}
        icon={Clock}
        details={`Awaiting review`}
        colorScheme="warning"
      />

      <StatCard
        label="Approved"
        value={statistics.totalApproved}
        icon={CheckCircle}
        details={`Winners selected`}
        colorScheme="success"
      />

      <StatCard
        label="Rejected"
        value={statistics.totalRejected}
        icon={XCircle}
        details={`Failed evaluation`}
        colorScheme="danger"
      />

      <StatCard
        label="Cancelled"
        value={statistics.totalCancelled}
        icon={Trash2}
        details={`Cancelled AOBs`}
        colorScheme="secondary"
      />

      <StatCard
        label="Active Evaluations"
        value={statistics.totalPending + statistics.totalSubmitted}
        icon={Award}
        details={`In process`}
        colorScheme="info"
      />
    </div>
  )
}
