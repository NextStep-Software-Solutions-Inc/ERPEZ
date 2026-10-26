// @vitest-environment jsdom

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BiddingScheduleGanttStrip } from './BiddingScheduleGanttStrip'
import * as biddingScheduleHooks from '../../bidding-schedule/handlers/hooks'

const mockCalendarEvents = vi.fn()

vi.mock('erpez-shared-lib', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>()
  return {
    ...actual,
    createQueryHookFromTemplate: () => () => mockCalendarEvents(),
  }
})

vi.mock('@/lib/fiscal-year-and-policies/requests/hooks/useProcurementActivityTypes', () => ({
  useProcurementActivityTypes: () => ({ data: { data: [] } }),
}))

vi.mock('../../bidding-schedule/handlers/hooks', () => ({
  useBiddingSchedule: vi.fn(),
}))

describe('BiddingScheduleGanttStrip', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('renders empty state when no schedule has been generated and calendar events do not match', () => {
    // No schedule generated for this resolution
    vi.mocked(biddingScheduleHooks.useBiddingSchedule).mockReturnValue({
      data: null,
      isPending: false,
    } as any)

    // Calendar events belong to OTHER resolutions/projects
    mockCalendarEvents.mockReturnValue({
      data: {
        events: [
          {
            id: 'ev-1',
            projectId: 'other-project-id',
            bacResolutionId: 'other-resolution-id',
            projectTitle: 'Unrelated Project 1',
            procurementActivityTypeName: 'Pre-Bid Conference',
            startDate: '2026-08-20T08:00:00Z',
            endDate: '2026-08-20T17:00:00Z',
            status: 'Completed',
          },
          {
            id: 'ev-2',
            projectId: 'other-project-id-2',
            bacResolutionId: 'other-resolution-id-2',
            projectTitle: 'Unrelated Project 2',
            procurementActivityTypeName: 'Submission & Opening of Bids',
            startDate: '2026-09-01T08:00:00Z',
            endDate: '2026-09-01T17:00:00Z',
            status: 'Completed',
          },
        ],
      },
      isPending: false,
    })

    render(
      <BiddingScheduleGanttStrip
        bacResolutionId="new-bac-res-123"
        bacResolutionNumber="BAC-RES-2026-342"
        action={<button>Open Schedule Workspace</button>}
      />,
    )

    // Should display empty state
    expect(
      screen.getByText('No bidding schedule milestones generated yet'),
    ).toBeDefined()
    expect(
      screen.getByText(/This BAC resolution does not have an active bidding timeline/i),
    ).toBeDefined()

    // Should NOT display unrelated milestones or window span
    expect(screen.queryByText('Pre-Bid Conference')).toBeNull()
    expect(screen.queryByText('Submission & Opening of Bids')).toBeNull()
    expect(screen.queryByText('Milestone Progress')).toBeNull()
    expect(screen.queryByText('Window Span')).toBeNull()

    // Badge should say "Not Scheduled"
    expect(screen.getByText('Not Scheduled')).toBeDefined()
    expect(screen.queryByText('RA 9184 Standard Schedule')).toBeNull()

    // View switcher toggles should NOT be displayed
    expect(screen.queryByText('Milestone Pipeline')).toBeNull()
    expect(screen.queryByText('Phase Timeline')).toBeNull()

    // Action button should be present
    expect(screen.getAllByText('Open Schedule Workspace').length).toBeGreaterThan(0)
  })

  it('renders official milestones when bidding schedule exists', () => {
    vi.mocked(biddingScheduleHooks.useBiddingSchedule).mockReturnValue({
      data: {
        data: {
          id: 'sched-1',
          bacResolutionId: 'new-bac-res-123',
          milestones: [
            {
              id: 'm-1',
              order: 1,
              name: 'Pre-Bid Conference',
              milestoneKey: 'pre-bid-conference',
              computedDate: '2026-10-01T09:00:00Z',
              completedAt: null,
            },
            {
              id: 'm-2',
              order: 2,
              name: 'Submission & Opening of Bids',
              milestoneKey: 'bid-submission-opening',
              computedDate: '2026-10-15T09:00:00Z',
              completedAt: null,
            },
          ],
        },
      },
      isPending: false,
    } as any)

    mockCalendarEvents.mockReturnValue({
      data: null,
      isPending: false,
    })

    render(
      <BiddingScheduleGanttStrip
        bacResolutionId="new-bac-res-123"
        bacResolutionNumber="BAC-RES-2026-342"
        action={<button>Open Schedule Workspace</button>}
      />,
    )

    // Should NOT display empty state
    expect(
      screen.queryByText('No bidding schedule milestones generated yet'),
    ).toBeNull()

    // Should display milestone pipeline and timeline elements
    expect(screen.getAllByText('Pre-Bid Conference').length).toBeGreaterThan(0)
    expect(screen.getByText('Submission & Opening of Bids')).toBeDefined()
    expect(screen.getByText('RA 9184 Standard Schedule')).toBeDefined()
    expect(screen.getByText('Milestone Pipeline')).toBeDefined()
    expect(screen.getByText('Phase Timeline')).toBeDefined()
    expect(screen.getByText('Milestone Progress')).toBeDefined()
    expect(screen.getByText('Window Span')).toBeDefined()
  })
})
