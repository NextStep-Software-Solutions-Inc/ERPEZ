/**
 * KPI Summary Cards Component
 *
 * Displays 4 key performance indicator cards with current values,
 * month-over-month changes, status indicators, and icons.
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

/**
 * Color theme for each KPI card
 */
interface KPICardTheme {
  /** Gradient background classes */
  bg: string
  /** Icon container classes */
  iconBg: string
  /** Icon color */
  iconColor: string
  /** Top accent border color */
  accent: string
  /** Value text color */
  valueColor: string
}

/**
 * Individual KPI Card Component
 */
interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  icon: React.ReactNode
  theme: KPICardTheme
}

function KPICard({
  title,
  value,
  subtitle,
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
      className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 ${theme.bg}`}
    >
      {/* Top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accent}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold text-gray-600">
          {title}
        </CardTitle>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.iconBg}`}
        >
          <span className={theme.iconColor}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className={`text-3xl font-bold ${theme.valueColor}`}>{value}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon className={`h-3 w-3 ${trendColorClass}`} />
            <span className={`text-xs font-semibold ${trendColorClass}`}>
              {trendValue}
            </span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading Skeleton for KPI Cards
 */
function KPICardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 bg-gray-200 rounded" />
        <div className="h-4 w-4 bg-gray-200 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="h-8 w-32 bg-gray-200 rounded" />
          <div className="h-3 w-40 bg-gray-200 rounded" />
          <div className="h-3 w-28 bg-gray-200 rounded mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Determine trend based on change value and metric type
 */
function getTrend(
  change: number,
  isPositiveGood = true,
): 'up' | 'down' | 'neutral' {
  if (Math.abs(change) < 0.5) return 'neutral'
  if (isPositiveGood) {
    return change > 0 ? 'up' : 'down'
  } else {
    return change > 0 ? 'down' : 'up'
  }
}

/**
 * Format trend value with sign and unit
 */
function formatTrendValue(change: number, unit = ''): string {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}${unit}`
}

/**
 * Define color themes for each KPI card
 */
const kpiThemes: KPICardTheme[] = [
  {
    // Total KPIs - Blue
    bg: 'bg-gradient-to-br from-blue-50 to-white',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    accent: 'bg-blue-500',
    valueColor: 'text-blue-700',
  },
  {
    // OPCR - Emerald green
    bg: 'bg-gradient-to-br from-emerald-50 to-white',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    accent: 'bg-emerald-500',
    valueColor: 'text-emerald-700',
  },
  {
    // Budget - Amber/Orange
    bg: 'bg-gradient-to-br from-amber-50 to-white',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    accent: 'bg-amber-500',
    valueColor: 'text-amber-700',
  },
  {
    // PPMP - Violet
    bg: 'bg-gradient-to-br from-violet-50 to-white',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    accent: 'bg-violet-500',
    valueColor: 'text-violet-700',
  },
]

/**
 * Main KPI Cards Component
 */
export function KPICards({ summary, isLoading }: KPICardsProps) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
        <KPICardSkeleton />
      </div>
    )
  }

  const cards: Omit<KPICardProps, 'theme'>[] = [
    {
      title: 'Total KPIs Encoded',
      value: summary.totalKPIsEncoded.toLocaleString('en-PH'),
      subtitle: 'Active performance indicators',
      trend: getTrend(summary.kpiChangeFromLastMonth),
      trendValue: formatTrendValue(summary.kpiChangeFromLastMonth, ' KPIs'),
      icon: <Target className="h-5 w-5" />,
    },
    {
      title: 'OPCR Submitted',
      value: `${summary.opcrSubmittedPercent.toFixed(1)}%`,
      subtitle: 'Office commitments reviewed',
      trend: getTrend(summary.opcrChangeFromLastMonth),
      trendValue: formatTrendValue(summary.opcrChangeFromLastMonth, '%'),
      icon: <FileCheck className="h-5 w-5" />,
    },
    {
      title: 'Budget Utilized',
      value: formatCurrencyAbbr(summary.budgetUtilized),
      subtitle: 'Current fiscal year spending',
      trend: getTrend(summary.budgetChangeFromLastMonth, false),
      trendValue: formatTrendValue(summary.budgetChangeFromLastMonth, '%'),
      icon: <DollarSign className="h-5 w-5" />,
    },
    {
      title: 'PPMP Consolidation',
      value: `${summary.ppmpConsolidationPercent.toFixed(1)}%`,
      subtitle: 'Procurement plans rolled up',
      trend: getTrend(summary.ppmpChangeFromLastMonth),
      trendValue: formatTrendValue(summary.ppmpChangeFromLastMonth, '%'),
      icon: <Package className="h-5 w-5" />,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <KPICard key={card.title} {...card} theme={kpiThemes[i]} />
      ))}
    </div>
  )
}
