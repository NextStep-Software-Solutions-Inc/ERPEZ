// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AppBudgetBurnGauge } from '../AppBudgetBurnGauge'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { BudgetBurnAnalytics } from '../../types/dashboardV2'

describe('AppBudgetBurnGauge Component', () => {
  const sampleData: BudgetBurnAnalytics = {
    approvedAppBudget: 50_000_000,
    totalCommittedContracts: 35_000_000,
    totalPendingCommitments: 5_000_000,
    unencumberedBalance: 10_000_000,
    budgetBurnPercentage: 70,
    unprogrammedPRCount: 0,
    unprogrammedPRTotalAmount: 0,
    budgetOverrunPRCount: 0,
  }

  const renderComponent = (props: {
    data?: BudgetBurnAnalytics | null
    isLoading?: boolean
    onFilterUnprogrammed?: () => void
  }) => {
    return render(
      <TooltipProvider>
        <AppBudgetBurnGauge {...props} />
      </TooltipProvider>
    )
  }

  it('renders loading placeholder when isLoading is true', () => {
    const { container } = renderComponent({ isLoading: true })
    expect(container.querySelector('.animate-pulse')).toBeDefined()
    expect(screen.queryByText('Annual Procurement Plan (APP) Budget Burn & Utilization')).toBeNull()
  })

  it('renders healthy budget burn state (<= 85%) with correct formatting and Philippine Peso icon', () => {
    const { container } = renderComponent({ data: sampleData })

    // Philippine Peso Icon check
    const pesoIcon = container.querySelector('.lucide-philippine-peso')
    expect(pesoIcon).toBeDefined()

    // Header and Badge
    expect(screen.getByText('Annual Procurement Plan (APP) Budget Burn & Utilization')).toBeDefined()
    expect(screen.getByText('On Budget Schedule')).toBeDefined()

    // Burn rate text
    expect(screen.getByText('70%')).toBeDefined()

    // 4 Metrics cards formatted in PHP (₱)
    expect(screen.getAllByText('₱50.00M').length).toBe(2) // Header ceiling + card
    expect(screen.getByText('₱35.00M')).toBeDefined()     // Committed Contracts
    expect(screen.getByText('₱5.00M')).toBeDefined()      // In Procurement
    expect(screen.getByText('₱10.00M')).toBeDefined()     // Unencumbered Balance
  })

  it('renders warning badge when budget burn is between 85% and 95%', () => {
    const warningData: BudgetBurnAnalytics = {
      ...sampleData,
      totalCommittedContracts: 45_000_000,
      budgetBurnPercentage: 90,
    }

    renderComponent({ data: warningData })
    expect(screen.getByText('Approaching Ceiling')).toBeDefined()
    expect(screen.getByText('90%')).toBeDefined()
  })

  it('renders critical badge when budget burn exceeds 95%', () => {
    const criticalData: BudgetBurnAnalytics = {
      ...sampleData,
      totalCommittedContracts: 49_000_000,
      budgetBurnPercentage: 98,
    }

    renderComponent({ data: criticalData })
    expect(screen.getByText('Critical Burn Exceeded')).toBeDefined()
    expect(screen.getByText('98%')).toBeDefined()
  })

  it('displays unprogrammed requisition alerts and handles filter click', () => {
    const onFilterMock = vi.fn()
    const dataWithAlerts: BudgetBurnAnalytics = {
      ...sampleData,
      unprogrammedPRCount: 3,
      unprogrammedPRTotalAmount: 750_000,
      budgetOverrunPRCount: 1,
    }

    renderComponent({ data: dataWithAlerts, onFilterUnprogrammed: onFilterMock })

    // Unprogrammed pill
    const pill = screen.getByTitle('Click to view unprogrammed requisitions in report tables')
    expect(pill).toBeDefined()
    expect(screen.getByText(/3 Unprogrammed PRs/)).toBeDefined()

    // Statutory warning callout
    expect(screen.getByText(/Statutory Compliance Alert:/)).toBeDefined()
    expect(screen.getByText(/GPPB Res. No. 07-2022/)).toBeDefined()

    // Clicking the pill triggers onFilterUnprogrammed callback
    fireEvent.click(pill)
    expect(onFilterMock).toHaveBeenCalledTimes(1)
  })
})
