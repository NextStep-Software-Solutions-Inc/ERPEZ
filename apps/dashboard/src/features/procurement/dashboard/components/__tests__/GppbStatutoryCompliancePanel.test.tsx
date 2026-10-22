// @vitest-environment jsdom

import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GppbStatutoryCompliancePanel } from '../GppbStatutoryCompliancePanel'
import { TooltipProvider } from '@/components/ui/tooltip'
import type { ProcurementHealthScorecard } from '../../types/dashboardV2'

describe('GppbStatutoryCompliancePanel Component', () => {
  const sampleScorecard: ProcurementHealthScorecard = {
    fiscalYear: 2026,
    healthScore: 92,
    healthScoreStatus: 'HEALTHY',
    budgetUtilizationRate: 75.0,
    procurementSavingsRate: 8.5,
    averageBidCount: 3.8,
    reopeningRate: 2.0,
    delayedProjectRate: 4.1,
    failedBidRate: 1.5,
    supplierConcentrationRate: 18.0,
    contractExecutionRate: 94.0,
    apcpiCompetitiveBiddingRate: 65.0,
    apcpiAlternativeModesRate: 35.0,
    apcpiThresholdComplianceRate: 98.0,
    apcpiOpportunityPostingRate: 96.0,
    apcpiObserverAttendanceRate: 92.0,
    apcpiDisputeResolutionRate: 100.0,
    apcpiBacSecretariatEfficiencyScore: 88.0,
    apcpiPlanningAdherenceScore: 94.0,
    apcpiAverageBiddersPerProject: 3.8,
    apcpiTurnaroundEfficiencyScore: 89.0,
  }

  const renderComponent = (props: {
    scorecard?: ProcurementHealthScorecard
    isLoading?: boolean
  }) => {
    return render(
      <TooltipProvider>
        <GppbStatutoryCompliancePanel {...props} />
      </TooltipProvider>
    )
  }

  it('renders fallback when no scorecard and no summary are available', () => {
    renderComponent({})
    expect(screen.getByText('No Statutory Audit Records Available')).toBeDefined()
  })

  it('renders PhilGEPS posting adherence module with Fully Compliant status when posting rate >= 95%', () => {
    renderComponent({ scorecard: sampleScorecard })

    expect(screen.getByText('PhilGEPS Posting Adherence')).toBeDefined()
    expect(screen.getByText('Fully Compliant')).toBeDefined()
    expect(screen.getByText('96%')).toBeDefined()
    expect(
      screen.getByText('All bid opportunities, RFQs, and awarded contracts have verified PhilGEPS Reference Numbers.')
    ).toBeDefined()
  })

  it('renders PhilGEPS posting adherence with Substantial status when posting rate < 95%', () => {
    const lowPostingScorecard: ProcurementHealthScorecard = {
      ...sampleScorecard,
      apcpiOpportunityPostingRate: 82.0,
    }

    renderComponent({ scorecard: lowPostingScorecard })

    expect(screen.getByText('PhilGEPS Posting Adherence')).toBeDefined()
    expect(screen.getByText('Substantial')).toBeDefined()
    expect(screen.getByText('82%')).toBeDefined()
    expect(
      screen.getByText('Attention needed: Some procurement documents require immediate posting on the PhilGEPS portal.')
    ).toBeDefined()
  })

  it('renders COA & NGO observers protocol module', () => {
    renderComponent({ scorecard: sampleScorecard })

    expect(screen.getByText('COA & NGO Observers Protocol')).toBeDefined()
    expect(screen.getByText('High Attendance')).toBeDefined()
    expect(screen.getByText('92%')).toBeDefined()
  })
})
