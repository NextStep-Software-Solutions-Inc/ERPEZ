import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FileText,
  GitMerge,
  BarChart2,
  Gavel,
  ShoppingCart,
  FileCheck,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { ProcurementKPISummary } from '../types'
import { formatCurrencyAbbr } from '@/utils/formatters'

interface Props {
  summary: ProcurementKPISummary | null
  isLoading?: boolean
}

interface KPICardTheme {
  bg: string
  iconBg: string
  iconColor: string
  accent: string
  valueColor: string
}

const themes: KPICardTheme[] = [
  { bg: 'bg-gradient-to-br from-blue-50 to-white',    iconBg: 'bg-blue-100',    iconColor: 'text-blue-600',   accent: 'bg-blue-500',    valueColor: 'text-blue-700' },
  { bg: 'bg-gradient-to-br from-emerald-50 to-white', iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600',accent: 'bg-emerald-500', valueColor: 'text-emerald-700' },
  { bg: 'bg-gradient-to-br from-violet-50 to-white',  iconBg: 'bg-violet-100',  iconColor: 'text-violet-600', accent: 'bg-violet-500',  valueColor: 'text-violet-700' },
  { bg: 'bg-gradient-to-br from-amber-50 to-white',   iconBg: 'bg-amber-100',   iconColor: 'text-amber-600',  accent: 'bg-amber-500',   valueColor: 'text-amber-700' },
  { bg: 'bg-gradient-to-br from-green-50 to-white',   iconBg: 'bg-green-100',   iconColor: 'text-green-600',  accent: 'bg-green-500',   valueColor: 'text-green-700' },
  { bg: 'bg-gradient-to-br from-sky-50 to-white',     iconBg: 'bg-sky-100',     iconColor: 'text-sky-600',    accent: 'bg-sky-500',     valueColor: 'text-sky-700' },
]



function getTrend(change: number, isPositiveGood = true): 'up' | 'down' | 'neutral' {
  if (Math.abs(change) < 0.5) return 'neutral'
  if (isPositiveGood) return change > 0 ? 'up' : 'down'
  return change > 0 ? 'down' : 'up'
}

function formatTrend(change: number, unit = ''): string {
  const sign = change > 0 ? '+' : ''
  return `${sign}${change.toFixed(1)}${unit}`
}

interface KPICardProps {
  title: string
  value: string | number
  subtitle: string
  trend: 'up' | 'down' | 'neutral'
  trendValue: string
  icon: React.ReactNode
  theme: KPICardTheme
}

function KPICard({ title, value, subtitle, trend, trendValue, icon, theme }: KPICardProps) {
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : Minus
  const trendColor =
    trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'

  return (
    <Card className={`relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 ${theme.bg}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${theme.accent}`} />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pt-5 pb-2">
        <CardTitle className="text-sm font-semibold text-gray-600">{title}</CardTitle>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${theme.iconBg}`}>
          <span className={theme.iconColor}>{icon}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-1">
          <div className={`text-3xl font-bold ${theme.valueColor}`}>{value}</div>
          <div className="text-xs text-gray-500">{subtitle}</div>
          <div className="flex items-center gap-1 mt-2">
            <TrendIcon className={`h-3 w-3 ${trendColor}`} />
            <span className={`text-xs font-semibold ${trendColor}`}>{trendValue}</span>
            <span className="text-xs text-gray-400">vs last month</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function Skeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-28 bg-gray-200 rounded" />
        <div className="h-5 w-5 bg-gray-200 rounded-full" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="h-8 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-36 bg-gray-200 rounded" />
          <div className="h-3 w-24 bg-gray-200 rounded mt-2" />
        </div>
      </CardContent>
    </Card>
  )
}

export function KPIStrip({ summary, isLoading }: Props) {
  if (isLoading || !summary) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
      </div>
    )
  }

  const cards: KPICardProps[] = [
    {
      title: 'Total Active PRs',
      value: summary.totalActivePRs,
      subtitle: `${summary.totalActivePRs - Math.round(summary.totalActivePRs * (summary.consolidatedPRsRate / 100))} not yet consolidated`,
      trend: getTrend(summary.prChangeFromLastMonth),
      trendValue: formatTrend(summary.prChangeFromLastMonth),
      icon: <FileText className="h-4 w-4" />,
      theme: themes[0],
    },
    {
      title: 'Consolidated PRs',
      value: `${summary.consolidatedPRsRate.toFixed(1)}%`,
      subtitle: 'Consolidation rate',
      trend: getTrend(summary.consolidationChangeFromLastMonth),
      trendValue: formatTrend(summary.consolidationChangeFromLastMonth, '%'),
      icon: <GitMerge className="h-4 w-4" />,
      theme: themes[1],
    },
    {
      title: 'Active RFQs',
      value: summary.activeRFQs,
      subtitle: 'Open for quotation',
      trend: getTrend(summary.rfqChangeFromLastMonth, false),
      trendValue: formatTrend(summary.rfqChangeFromLastMonth),
      icon: <BarChart2 className="h-4 w-4" />,
      theme: themes[2],
    },
    {
      title: 'Pending BAC Resolutions',
      value: summary.pendingBACResolutions,
      subtitle: 'Awaiting resolution',
      trend: getTrend(summary.bacChangeFromLastMonth, false),
      trendValue: formatTrend(summary.bacChangeFromLastMonth),
      icon: <Gavel className="h-4 w-4" />,
      theme: themes[3],
    },
    {
      title: 'POs Issued',
      value: formatCurrencyAbbr(summary.totalPOValue),
      subtitle: 'Total PO value this FY',
      trend: getTrend(summary.poValueChangeFromLastMonth),
      trendValue: formatTrend(summary.poValueChangeFromLastMonth, '%'),
      icon: <ShoppingCart className="h-4 w-4" />,
      theme: themes[4],
    },
    {
      title: 'Active Contracts',
      value: summary.activeContracts,
      subtitle: 'Ongoing contract agreements',
      trend: getTrend(summary.contractChangeFromLastMonth),
      trendValue: formatTrend(summary.contractChangeFromLastMonth),
      icon: <FileCheck className="h-4 w-4" />,
      theme: themes[5],
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card) => (
        <KPICard key={card.title} {...card} />
      ))}
    </div>
  )
}
