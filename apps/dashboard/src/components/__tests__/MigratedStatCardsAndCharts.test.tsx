// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react'
import { FileText } from 'lucide-react'
import { afterEach, describe, expect, it } from 'vitest'
import { StatCard } from '@/components/StatCard'
import { BudgetAllocationStats } from '@/components/features/planning/budget-allocation/components/BudgetAllocationStats'
import { AppStatsGrid } from '@/features/planning/app-consolidation/components/AppStatsGrid'
import { QuickStatsGrid } from '@/features/planning/line-item-budgeting/line-item-budget/components/QuickStatsGrid'
import { MarketScopingOverview } from '@/features/planning/market-scoping/components/MarketScopingOverview'
import { PpmpManagementOverview } from '@/features/planning/ppmp/components/PpmpManagementOverview'
import SummaryCards from '@/features/procurement/bac-resolution/components/SummaryCards'
import { KPIStrip } from '@/features/procurement/dashboard/components/KPIStrip'

describe('Migrated Stat Cards & Semantic Token Components', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders StatCard default scheme with semantic tokens instead of raw slate classes', () => {
    const { container } = render(
      <StatCard label="Total Records" value={42} icon={FileText} colorScheme="default" />,
    )
    expect(screen.getByText('Total Records')).toBeDefined()
    expect(screen.getByText('42')).toBeDefined()
    expect(container.innerHTML).toContain('bg-card')
    expect(container.innerHTML).not.toContain('bg-slate-50')
  })

  it('renders QuickStatsGrid, AppStatsGrid, and BudgetAllocationStats via shared StatCard', () => {
    const { container } = render(
      <div>
        <QuickStatsGrid stats={{ total: 12, draft: 3, approved: 9, totalBudget: 2500000 }} />
        <AppStatsGrid
          app={{ fiscalYear: 2026, aggregationResults: { totalAmount: 4500000 } } as any}
          itemCount={18}
          totalQuantity={240}
        />
        <BudgetAllocationStats
          stats={{
            totalReceivedAmount: 10000000,
            totalRemainingAmount: 4000000,
            totalUtilizedAmount: 6000000,
          }}
        />
      </div>,
    )

    expect(screen.getByText('Total LIBs')).toBeDefined()
    expect(screen.getByText('FY 2026')).toBeDefined()
    expect(screen.getByText('Total Received Funds')).toBeDefined()
    expect(container.innerHTML).not.toContain('bg-white')
    expect(container.innerHTML).not.toContain('text-gray-900')
  })

  it('renders KPIStrip, SummaryCards, MarketScopingOverview, and PpmpManagementOverview without hardcoded bg-white', () => {
    const { container } = render(
      <div>
        <KPIStrip
          summary={{
            totalActivePRs: 15,
            prChangeFromLastMonth: 2,
            consolidatedPRsRate: 80,
            consolidationChangeFromLastMonth: 5,
            activeRFQs: 4,
            rfqChangeFromLastMonth: -1,
            pendingBACResolutions: 2,
            bacChangeFromLastMonth: 0,
            totalPOValue: 1500000,
            poValueChangeFromLastMonth: 12,
            activeContracts: 6,
            contractChangeFromLastMonth: 1,
          }}
        />
        <SummaryCards
          metricCards={[
            { key: 'summary', label: 'All', count: 10, icon: FileText } as any,
            { key: 'approved', label: 'Approved', count: 6, icon: FileText } as any,
          ]}
          activeFilter="all"
        />
        <MarketScopingOverview
          forms={[{ estimatedBudget: 500000, status: 'Approved' } as any]}
          statusSummary={{ draft: 1, pending: 2, approved: 3 }}
        />
        <PpmpManagementOverview
          summary={{
            totalCeiling: 5000000,
            psCeiling: 2000000,
            mooeCeiling: 2000000,
            coCeiling: 1000000,
            procurableAmount: 3000000,
            usedAmount: 2500000,
            remainingAmount: 2500000,
            hasConfiguredCeiling: true,
            draftCount: 1,
            pendingCount: 1,
            approvedCount: 4,
          }}
        />
      </div>,
    )

    expect(screen.getByText('Total Active PRs')).toBeDefined()
    expect(screen.getByText('Market Scoping Overview')).toBeDefined()
    expect(screen.getByText('PPMP Management Overview')).toBeDefined()
    expect(container.innerHTML).not.toContain('bg-white')
  })
})
