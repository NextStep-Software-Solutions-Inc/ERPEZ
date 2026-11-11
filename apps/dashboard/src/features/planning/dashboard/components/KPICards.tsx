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

const statusToneStyles: Record<
  StatusTone,
  {
    cardClass: string
    borderLeftColor: string
    ratioPillClass: string
  }
> = {
  green: {
    cardClass:
      'bg-gradient-to-br from-emerald-500/[0.06] via-card to-card dark:from-emerald-500/[0.11] dark:via-card dark:to-card',
    borderLeftColor: '#1baf7a',
    ratioPillClass:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30',
  },
  amber: {
    cardClass:
      'bg-gradient-to-br from-amber-500/[0.06] via-card to-card dark:from-amber-500/[0.11] dark:via-card dark:to-card',
    borderLeftColor: '#eda100',
    ratioPillClass:
      'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30',
  },
  red: {
    cardClass:
      'bg-gradient-to-br from-rose-500/[0.06] via-card to-card dark:from-rose-500/[0.11] dark:via-card dark:to-card',
    borderLeftColor: '#d03b3b',
    ratioPillClass:
      'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30',
  },
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
      ? 'text-emerald-600 dark:text-emerald-400'
      : trend === 'down'
        ? 'text-rose-600 dark:text-rose-400'
        : 'text-muted-foreground'

  const tone = statusToneStyles[statusTone]

  return (
    <Card
      className={`relative overflow-hidden bg-card border border-border/80 border-l-4 shadow-xs hover:shadow-md transition-all duration-150 ${tone.cardClass}`}
      style={{ borderLeftColor: tone.borderLeftColor }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-4 pb-2">
        <CardTitle className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </CardTitle>
        <div
          className={`flex h-8 w-8 items-center justify-center rounded-lg border ${theme.iconBg}`}
        >
          <span className={theme.iconColor}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className={`text-2xl font-bold tracking-tight tabular-nums ${theme.valueColor}`}>
              {value}
            </span>
            {ratioLabel && (
              <span className={`text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded border ${tone.ratioPillClass}`}>
                {ratioLabel}
              </span>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-normal truncate" title={subtitle}>
            {subtitle}
          </div>

          {trendValue && (
            <div className="flex items-center gap-1 mt-1 pt-1.5 border-t border-border/60">
              <TrendIcon className={`h-3 w-3 ${trendColorClass}`} />
              <span className={`text-[11px] font-medium ${trendColorClass}`}>
                {trendValue}
              </span>
              <span className="text-[11px] text-muted-foreground font-normal">vs last month</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function KPICardSkeleton() {
  return (
    <Card className="animate-pulse bg-card border border-border/80 border-l-4 border-l-muted-foreground/30 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-3 w-24 bg-muted rounded" />
        <div className="h-8 w-8 bg-muted rounded-lg" />
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-2">
          <div className="h-7 w-28 bg-muted rounded" />
          <div className="h-3 w-36 bg-muted rounded" />
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
    iconBg: 'bg-blue-500/10 border-blue-500/15 dark:bg-blue-500/15 dark:border-blue-400/20',
    iconColor: 'text-blue-600 dark:text-blue-400',
    valueColor: 'text-foreground',
  },
  {
    // OPCR - Emerald green
    iconBg: 'bg-emerald-500/10 border-emerald-500/15 dark:bg-emerald-500/15 dark:border-emerald-400/20',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    valueColor: 'text-foreground',
  },
  {
    // Budget - Amber/Orange
    iconBg: 'bg-amber-500/10 border-amber-500/15 dark:bg-amber-500/15 dark:border-amber-400/20',
    iconColor: 'text-amber-600 dark:text-amber-400',
    valueColor: 'text-foreground',
  },
  {
    // PPMP - Violet
    iconBg: 'bg-violet-500/10 border-violet-500/15 dark:bg-violet-500/15 dark:border-violet-400/20',
    iconColor: 'text-violet-600 dark:text-violet-400',
    valueColor: 'text-foreground',
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
