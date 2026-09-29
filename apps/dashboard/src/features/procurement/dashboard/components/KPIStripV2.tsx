import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Clock,
  FileCheck,
  FileSignature,
  FileText,
  Layers,
  Minus,
  PieChart,
  Send,
  ShoppingBag,
  ShoppingCart,
  TrendingDown,
  Zap
} from 'lucide-react'
import type { ProcurementDashboardSummary } from '../types/dashboardV2'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface KPIStripV2Props {
  summary?: ProcurementDashboardSummary
  isLoading?: boolean
}

function formatCurrency(amount: number): string {
  if (amount >= 1_000_000_000) return `₱${(amount / 1_000_000_000).toFixed(2)}B`
  if (amount >= 1_000_000) return `₱${(amount / 1_000_000).toFixed(2)}M`
  if (amount >= 1_000) return `₱${(amount / 1_000).toFixed(1)}K`
  return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function DeltaBadge({ delta, invert = false }: { delta?: number | null; invert?: boolean }) {
  if (delta === undefined || delta === null) {
    return (
      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
        <Minus className="w-3 h-3" /> vs prior yr
      </span>
    )
  }

  const isPositive = delta > 0
  const isGood = invert ? !isPositive : isPositive

  return (
    <span
      className={`text-[10px] font-medium flex items-center gap-0.5 px-1.5 py-0.5 rounded-full ${
        isGood ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
      }`}
    >
      {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(delta)}% YoY
    </span>
  )
}

export function KPIStripV2({ summary, isLoading }: KPIStripV2Props) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {Array.from({ length: 13 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted/40 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  const s = summary || {
    totalActivePRs: 0,
    totalPRAmount: 0,
    consolidatedPRsRate: 0,
    activeRFQs: 0,
    pendingBACResolutions: 0,
    totalNOACount: 0,
    totalNOAAmount: 0,
    totalPOCount: 0,
    totalPOValue: 0,
    activeContracts: 0,
    directContractingCount: 0,
    directContractingAmount: 0,
    directAcquisitionCount: 0,
    directAcquisitionAmount: 0,
    overdueItemsCount: 0,
    avgProcurementTatDays: 0,
    savingsRate: 0,
    budgetUtilizationRate: 0,
    prChangeYoY: null,
    consolidationChangeYoY: null,
    rfqChangeYoY: null,
    bacChangeYoY: null,
    poValueChangeYoY: null,
    contractChangeYoY: null,
    savingsRateChangeYoY: null,
    requests: { totalCount: 0, subItems: [] },
    bidding: { totalCount: 0, subItems: [] },
    award: { totalCount: 0, subItems: [] },
    ordering: { totalCount: 0, subItems: [] },
    directMethods: { totalCount: 0, subItems: [] },
    consolidation: { total: 0, consolidated: 0, inProgress: 0, pending: 0, percent: 0, stalledPRs: 0 },
    overduePRCount: 0,
    rfqsClosingIn3Days: 0,
    pendingNTPCount: 0,
    stalledProcurementCount: 0,
    budgetNearLimit: false,
  }

  const kpis = [
    {
      title: 'Active PRs',
      value: s.totalActivePRs.toLocaleString(),
      subValue: formatCurrency(s.totalPRAmount),
      delta: s.prChangeYoY,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Consolidation Rate',
      value: `${s.consolidatedPRsRate}%`,
      subValue: `${s.consolidation.consolidated} of ${s.consolidation.total} PRs`,
      delta: s.consolidationChangeYoY,
      icon: Layers,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
    },
    {
      title: 'Active RFQs',
      value: s.activeRFQs.toLocaleString(),
      subValue: 'Quotations underway',
      delta: s.rfqChangeYoY,
      icon: Send,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
    {
      title: 'Pending BAC Res.',
      value: s.pendingBACResolutions.toLocaleString(),
      subValue: 'Awaiting resolution',
      delta: s.bacChangeYoY,
      icon: FileCheck,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      invert: true,
    },
    {
      title: 'NOAs Issued',
      value: s.totalNOACount.toLocaleString(),
      subValue: formatCurrency(s.totalNOAAmount),
      delta: null,
      icon: Award,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'Total PO Value',
      value: formatCurrency(s.totalPOValue),
      subValue: `${s.totalPOCount} purchase orders`,
      delta: s.poValueChangeYoY,
      icon: ShoppingCart,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Active Contracts',
      value: s.activeContracts.toLocaleString(),
      subValue: 'Executed agreements',
      delta: s.contractChangeYoY,
      icon: FileSignature,
      color: 'text-teal-500',
      bgColor: 'bg-teal-500/10',
    },
    {
      title: 'Direct Contracting',
      value: s.directContractingCount.toLocaleString(),
      subValue: formatCurrency(s.directContractingAmount),
      delta: null,
      icon: Zap,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Direct Acquisition',
      value: s.directAcquisitionCount.toLocaleString(),
      subValue: formatCurrency(s.directAcquisitionAmount),
      delta: null,
      icon: ShoppingBag,
      color: 'text-pink-500',
      bgColor: 'bg-pink-500/10',
    },
    {
      title: 'Overdue Items',
      value: s.overdueItemsCount.toLocaleString(),
      subValue: `${s.overduePRCount} PRs · ${s.rfqsClosingIn3Days} RFQs`,
      delta: null,
      icon: AlertTriangle,
      color: s.overdueItemsCount > 0 ? 'text-rose-500' : 'text-muted-foreground',
      bgColor: s.overdueItemsCount > 0 ? 'bg-rose-500/10' : 'bg-muted/50',
      invert: true,
    },
    {
      title: 'Avg Procurement TAT',
      value: `${s.avgProcurementTatDays}d`,
      subValue: 'PR to PO cycle',
      delta: null,
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-600/10',
      invert: true,
    },
    {
      title: 'Savings Rate',
      value: `${s.savingsRate}%`,
      subValue: 'ABC vs Awarded',
      delta: s.savingsRateChangeYoY,
      icon: TrendingDown,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-600/10',
    },
    {
      title: 'Budget Utilization',
      value: `${s.budgetUtilizationRate}%`,
      subValue: 'PO / PPMP Budget',
      delta: null,
      icon: PieChart,
      color: s.budgetUtilizationRate > 90 ? 'text-rose-600' : 'text-blue-500',
      bgColor: s.budgetUtilizationRate > 90 ? 'bg-rose-600/10' : 'bg-blue-500/10',
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon
        return (
          <Card key={idx} className="relative overflow-hidden border border-border/80 shadow-xs hover:shadow-md transition-shadow">
            <CardContent className="p-3.5 flex flex-col justify-between h-full">
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-medium text-muted-foreground line-clamp-1">{kpi.title}</span>
                <div className={`p-1.5 rounded-md ${kpi.bgColor} ${kpi.color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>
              </div>

              <div>
                <div className="text-lg font-bold tracking-tight text-foreground">{kpi.value}</div>
                <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{kpi.subValue}</div>
              </div>

              <div className="mt-2 pt-2 border-t border-border/40 flex items-center justify-between">
                <DeltaBadge delta={kpi.delta} invert={kpi.invert} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
