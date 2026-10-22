import { MonthlyPRChart } from './charts/MonthlyPRChart'
import { MonthlyPOValueChart } from './charts/MonthlyPOValueChart'
import { ModeDistributionChart } from './charts/ModeDistributionChart'
import { TopOfficesChart } from './charts/TopOfficesChart'
import { ContractStatusChart } from './charts/ContractStatusChart'
import { TopSuppliersChart } from './charts/TopSuppliersChart'
import { OverdueTrendChart } from './charts/OverdueTrendChart'
import { TatBenchmarkChart } from './charts/TatBenchmarkChart'
import { AbcVsAwardedChart } from './charts/AbcVsAwardedChart'
import { QuarterlyKpiChart } from './charts/QuarterlyKpiChart'
import { ModeShiftChart } from './charts/ModeShiftChart'
import { YearOverYearTable } from './charts/YearOverYearTable'
import type { ProcurementDashboardAnalytics } from '../types/dashboardV2'

interface AnalyticsDashboardProps {
  data?: ProcurementDashboardAnalytics
  isLoading?: boolean
  selectedOffice?: string
  onSelectOffice?: (officeName: string, officeId?: string) => void
  selectedMode?: string
  onSelectMode?: (modeName: string) => void
}

export function AnalyticsDashboard({
  data,
  isLoading,
  selectedOffice,
  onSelectOffice,
  selectedMode,
  onSelectMode,
}: AnalyticsDashboardProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 bg-muted/30 animate-pulse rounded-xl" />
        ))}
      </div>
    )
  }

  const d = data || {
    monthlyPRCount: [],
    monthlyPOValue: [],
    modeDistribution: [],
    topSpendingOffices: [],
    contractStatusDist: [],
    topSuppliers: [],
    overdueTrend: [],
    tatBenchmark: [],
    abcVsAwarded: [],
    quarterlyKpiComparison: [],
    modeShiftByQuarter: [],
    yearOverYear: {
      currentYear: new Date().getFullYear(),
      priorYear: new Date().getFullYear() - 1,
      currentYearPRCount: 0,
      priorYearPRCount: 0,
      currentYearPOValue: 0,
      priorYearPOValue: 0,
      currentYearContractCount: 0,
      priorYearContractCount: 0,
      currentYearSavingsRate: 0,
      priorYearSavingsRate: 0,
    },
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <MonthlyPRChart data={d.monthlyPRCount} />
        <MonthlyPOValueChart data={d.monthlyPOValue} />
        <ModeDistributionChart
          data={d.modeDistribution}
          selectedMode={selectedMode}
          onSelectMode={onSelectMode}
        />
        <TopOfficesChart
          data={d.topSpendingOffices}
          selectedOffice={selectedOffice}
          onSelectOffice={onSelectOffice}
        />
        <ContractStatusChart data={d.contractStatusDist} />
        <TopSuppliersChart data={d.topSuppliers} />
        <OverdueTrendChart data={d.overdueTrend} />
        <TatBenchmarkChart data={d.tatBenchmark} />
        <AbcVsAwardedChart data={d.abcVsAwarded} />
        <QuarterlyKpiChart data={d.quarterlyKpiComparison} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <ModeShiftChart data={d.modeShiftByQuarter} />
        <YearOverYearTable data={d.yearOverYear} />
      </div>
    </div>
  )
}
