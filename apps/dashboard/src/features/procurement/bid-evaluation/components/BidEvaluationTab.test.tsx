// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BidEvaluationTab } from './BidEvaluationTab'
import * as apiHooks from '../hooks/useBidEvaluationApi'

vi.mock('../hooks/useBidEvaluationApi', () => ({
  useProjectBidEvaluation: vi.fn(),
  useProjectBiddingSubmissions: vi.fn(),
  useEvaluateProjectBids: vi.fn(() => ({
    mutateAsync: vi.fn(),
    isPending: false,
  })),
}))

describe('BidEvaluationTab - Re-evaluate Bids Winner Lock', () => {
  const mockProjectId = '00000000-0000-0000-0000-000000000001'

  const mockSubmissions = [
    {
      id: 'sub-1',
      supplierId: 'sup-1',
      supplierName: 'Alpha Tech Corp',
      originalProposedAmount: 1000000,
      openingRecord: {
        id: 'rec-1',
        envelope1Result: 'Passed',
        envelope2Opened: true,
        asReadBidAmount: 1000000,
      },
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(apiHooks.useProjectBiddingSubmissions).mockReturnValue({
      data: mockSubmissions as any,
      isLoading: false,
      isError: false,
    } as any)
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders "Execute Bid Evaluation" when no bids have been evaluated yet', () => {
    vi.mocked(apiHooks.useProjectBidEvaluation).mockReturnValue({
      data: {
        id: 'eval-1',
        awardCriterion: 'LCRB',
        evaluatedBids: [],
        awardRecommendation: null,
      } as any,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any)

    render(
      <BidEvaluationTab
        projectId={mockProjectId}
        awardCriterion="LCRB"
      />,
    )

    const buttons = screen.getAllByRole('button', { name: /Execute Bid Evaluation|Run Bid Evaluation/i })
    expect(buttons.length).toBeGreaterThan(0)
    expect(screen.queryByText(/Winner Declared/i)).toBeNull()
  })

  it('renders enabled "Re-evaluate Bids" button when bids are evaluated but no winner is declared', () => {
    vi.mocked(apiHooks.useProjectBidEvaluation).mockReturnValue({
      data: {
        id: 'eval-1',
        awardCriterion: 'LCRB',
        evaluatedBids: [
          {
            id: 'eb-1',
            supplierId: 'sup-1',
            supplierName: 'Alpha Tech Corp',
            evaluatedBidPrice: 950000,
            rank: 1,
            status: 'Ranked',
            isResponsive: true,
            postQualification: null,
          },
        ],
        awardRecommendation: null,
      } as any,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any)

    render(
      <BidEvaluationTab
        projectId={mockProjectId}
        awardCriterion="LCRB"
      />,
    )

    const reEvalButton = screen.getByRole('button', { name: /Re-evaluate Bids/i })
    expect(reEvalButton).toBeDefined()
    expect(reEvalButton.hasAttribute('disabled')).toBe(false)
    expect(screen.queryByText(/Winner Declared/i)).toBeNull()
  })

  it('disables "Re-evaluate Bids" and displays Winner Declared badge once an award recommendation exists', () => {
    vi.mocked(apiHooks.useProjectBidEvaluation).mockReturnValue({
      data: {
        id: 'eval-1',
        awardCriterion: 'LCRB',
        evaluatedBids: [
          {
            id: 'eb-1',
            supplierId: 'sup-1',
            supplierName: 'Alpha Tech Corp',
            evaluatedBidPrice: 950000,
            rank: 1,
            status: 'Passed_PostQual',
            isResponsive: true,
            postQualification: { status: 'Passed', passed: true },
          },
        ],
        awardRecommendation: {
          id: 'award-1',
          winningSupplierName: 'Alpha Tech Corp',
          awardedAmount: 950000,
        },
      } as any,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any)

    render(
      <BidEvaluationTab
        projectId={mockProjectId}
        awardCriterion="LCRB"
      />,
    )

    // Button should be disabled
    const reEvalButton = screen.getByRole('button', { name: /Re-evaluate Bids/i })
    expect(reEvalButton).toBeDefined()
    expect(reEvalButton.hasAttribute('disabled')).toBe(true)

    // Winner declared badge should be visible
    expect(screen.getByText(/Winner Declared/i)).toBeDefined()
    expect(screen.getAllByText(/Alpha Tech Corp/i).length).toBeGreaterThanOrEqual(1)
  })

  it('disables "Re-evaluate Bids" when a candidate has passed post-qualification', () => {
    vi.mocked(apiHooks.useProjectBidEvaluation).mockReturnValue({
      data: {
        id: 'eval-1',
        awardCriterion: 'LCRB',
        evaluatedBids: [
          {
            id: 'eb-1',
            supplierId: 'sup-1',
            supplierName: 'Alpha Tech Corp',
            evaluatedBidPrice: 950000,
            rank: 1,
            status: 'Under_PostQual',
            isResponsive: true,
            postQualification: { status: 'Passed', passed: true },
          },
        ],
        awardRecommendation: null,
      } as any,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    } as any)

    render(
      <BidEvaluationTab
        projectId={mockProjectId}
        awardCriterion="LCRB"
      />,
    )

    const reEvalButton = screen.getByRole('button', { name: /Re-evaluate Bids/i })
    expect(reEvalButton.hasAttribute('disabled')).toBe(true)
    expect(screen.getByText(/Winner Declared/i)).toBeDefined()
  })
})
