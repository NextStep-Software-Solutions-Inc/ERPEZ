/**
 * Executive Planning Snapshot — KPI Summary Cards
 *
 * Displays 4 key performance indicator cards with a left-border status color:
 * - Green (#1baf7a) -> value meets or exceeds target
 * - Amber (#eda100) -> partially complete / pending items exist
 * - Red   (#d03b3b) -> critically below target / over ceiling
 *
 * Also includes a one-line status label below the value.
 *
 * @module features/planning/dashboard/components/KPICards
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Target,
  FileCheck,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { DashboardSummary } from '../types'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface KPICardsProps {
  summary: DashboardSummary | null
  isLoading?: boolean
}

type StatusTone = 'green' | 'amber' | 'red'

function getStatusStyle(status: StatusTone) {
  const map = {
    green: {
      borderLeftColor: '#1baf7a',
      backgroundColor: 'color-mix(in srgb, #1baf7a 8%, transparent)',
    },
    amber: {
      borderLeftColor: '#eda100',
      backgroundColor: 'color-mix(in srgb, #eda100 8%, transparent)',
    },
    red: {
      borderLeftColor: '#d03b3b',
      backgroundColor: 'color-mix(in srgb, #d03b3b 8%, transparent)',
    },
  }
  return map[status]
}

interface KPICardTheme {
  iconBg: string
  iconColor: string
  valueColor: string
}

interface KPICardProps {
  title: string
  value: string | number
  ratioLabel?: string
  subtitle: string
  statusTone: StatusTone
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon: React.ReactNode
  theme: KPICardTheme
}

function KPICard({
  title,
  value,
  ratioLabel,
  subtitle,
  statusTone,
  trend,
  trendValue,
  icon,
  theme,
}: KPICardProps) {
  const TrendIcon =
    trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus

  const trendColorClass =
    trend === 'up'
      ? 'text-emerald-600'
      : trend === 'down'
        ? 'text-red-500'
        : 'text-gray-400'

  return (
    <Card
      className="relative overflow-hidden border border-gray-100 border-l-4 shadow-sm hover:shadow transition-all duration-150"
      style={getStatusStyle(statusTone)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-2">
        <CardTitle className="text-xs font-medium uppercase tracking-wider text-gray-500">
          {title}
        </CardTitle>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${theme.iconBg}`}
        >
          <span className={theme.iconColor}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight ${theme.valueColor}`}>
              {value}
            </span>
            {ratioLabel && (
              <span className="text-xs font-normal text-gray-600 bg-white/90 px-1.5 py-0.5 rounded border border-gray-200/60">
                {ratioLabel}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-500 font-normal truncate" title={subtitle}>
            {subtitle}
          </div>

          {trendValue && (
            <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-gray-100/70">
              <TrendIcon className={`h-3 w-3 ${trendColorClass}`} />
              <span className={`text-[11px] font-medium ${trendColorClass}`}>
                {trendValue}
              </span>
              <span className="text-[11px] text-gray-400 font-normal">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KPICardSkeleton() {
  return (
    <Card className="animate-pulse border border-gray-100 border-l-4 border-l-gray-300 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-3 w-24 bg-gray-200 rounded" />
        <div className="h-7 w-7 bg-gray-200 rounded-lg" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="h-7 w-28 bg-gray-200 rounded" />
          <div className="h-3 w-36 bg-gray-200 rounded" />
        </div>
      </CardContent>
    </Card>
  )
}

function getTrend(
  change: number,
  isPositiveGood = true,
): 'up' | 'down' | 'neutral' {
  if (Math.abs(change) < 0.5) return 'neutral'
  return isPositiveGood ? (change > 0 ? 'up' : 'down') : (change > 0 ? 'down' : 'up')
}

function formatTrendValue(change: number, unit = ''): string {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}${unit}`
}

const kpiThemes: KPICardTheme[] = [
  {
    // Total KPIs - Blue
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    valueColor: 'text-gray-900',
  },
  {
    // OPCR - Emerald green
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    valueColor: 'text-gray-900',
  },
  {
    // Budget - Amber/Orange
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    valueColor: 'text-gray-900',
  },
  {
    // PPMP - Violet
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    valueColor: 'text-gray-900',
  },
]

export function KPICards({ summary, isLoading }: KPICardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
    )
  }

  // 1. Total KPIs
  const kpiCount = summary.totalKPIsEncoded
  const kpiSubtitle = summary.encodedThisMonth > 0
    ? `${summary.encodedThisMonth} encoded this month`
    : 'Active performance indicators'
  const kpiStatusTone: StatusTone = summary.totalKPIsEncoded > 0 ? 'green' : 'amber'

  // 2. OPCR Submission
  const opcrValue = summary.totalOPCRs > 0
    ? `${summary.submittedOPCRs} / ${summary.totalOPCRs}`
    : `${summary.submittedOPCRs} Submitted`
  const opcrRatio = summary.totalOPCRs > 0
    ? `${summary.opcrSubmittedPercent.toFixed(0)}%`
    : undefined
  const opcrSubtitle = summary.totalOPCRs === 0
    ? 'No OPCRs configured'
    : summary.pendingOPCRs > 0
      ? `${summary.pendingOPCRs} pending review`
      : 'On track — All submitted'
  const opcrStatusTone: StatusTone = summary.totalOPCRs > 0 && summary.pendingOPCRs === 0
    ? 'green'
    : summary.submittedOPCRs > 0
      ? 'amber'
      : summary.totalOPCRs === 0
        ? 'amber'
        : 'red'

  // 3. Budget Programmed
  const budgetValue = formatCurrencyAbbr(summary.budgetUtilized)
  const budgetRatio = summary.budgetPlanned > 0
    ? `${summary.budgetUtilizationPercent.toFixed(0)}%`
    : undefined
  const budgetSubtitle = summary.budgetPlanned > 0
    ? summary.budgetUtilizationPercent > 100
      ? `Over ceiling (of ${formatCurrencyAbbr(summary.budgetPlanned)})`
      : summary.budgetUtilizationPercent >= 85
        ? `On track (of ${formatCurrencyAbbr(summary.budgetPlanned)})`
        : summary.budgetUtilizationPercent >= 50
          ? `Partially programmed (of ${formatCurrencyAbbr(summary.budgetPlanned)})`
          : `Below target (of ${formatCurrencyAbbr(summary.budgetPlanned)})`
    : 'Programmed line-item budget'
  const budgetStatusTone: StatusTone = summary.budgetUtilizationPercent > 100
    ? 'red'
    : summary.budgetUtilizationPercent >= 85
      ? 'green'
      : summary.budgetUtilizationPercent >= 50
        ? 'amber'
        : 'red'

  // 4. PPMP Consolidation
  const ppmpValue = summary.totalPPMPs > 0
    ? `${summary.consolidatedPPMPs} / ${summary.totalPPMPs}`
    : `${summary.consolidatedPPMPs} Consolidated`
  const ppmpRatio = summary.totalPPMPs > 0
    ? `${summary.ppmpConsolidationPercent.toFixed(0)}%`
    : undefined
  const ppmpSubtitle = summary.totalPPMPs === 0
    ? 'No PPMPs submitted'
    : summary.pendingPPMPs > 0
      ? `${summary.pendingPPMPs} pending consolidation`
      : summary.inProgressPPMPs > 0
        ? `${summary.inProgressPPMPs} in progress`
        : 'On track — All consolidated'
  const ppmpStatusTone: StatusTone = summary.totalPPMPs > 0 && summary.pendingPPMPs === 0
    ? 'green'
    : summary.consolidatedPPMPs > 0
      ? 'amber'
      : summary.totalPPMPs === 0
        ? 'amber'
        : 'red'

  const cards: Omit<KPICardProps, 'theme'>[] = [
    {
      title: 'Total KPIs Encoded',
      value: `${kpiCount} KPIs`,
      subtitle: kpiSubtitle,
      statusTone: kpiStatusTone,
      trend: getTrend(summary.kpiChangeFromLastMonth),
      trendValue: summary.kpiChangeFromLastMonth !== 0
        ? formatTrendValue(summary.kpiChangeFromLastMonth, ' KPIs')
        : undefined,
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: 'OPCR Submission',
      value: opcrValue,
      ratioLabel: opcrRatio,
      subtitle: opcrSubtitle,
      statusTone: opcrStatusTone,
      icon: <FileCheck className="h-4 w-4" />,
    },
    {
      title: 'Budget Programmed',
      value: budgetValue,
      ratioLabel: budgetRatio,
      subtitle: budgetSubtitle,
      statusTone: budgetStatusTone,
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      title: 'PPMP Consolidation',
      value: ppmpValue,
      ratioLabel: ppmpRatio,
      subtitle: ppmpSubtitle,
      statusTone: ppmpStatusTone,
      icon: <Package className="h-4 w-4" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <KPICard key={card.title} {...card} theme={kpiThemes[i]} />
      ))}
    </div>
  )
}
