// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

const mockPage = vi.fn(
  ({
    selectedResolutionId,
    selectedEventId,
    drawerTab,
  }: {
    selectedResolutionId?: string
    selectedEventId?: string
    drawerTab?: string
  }) => (
    <div>
      <div>resolution:{selectedResolutionId ?? 'none'}</div>
      <div>event:{selectedEventId ?? 'none'}</div>
      <div>tab:{drawerTab ?? 'none'}</div>
    </div>
  ),
)

vi.mock('@/features/procurement/bidding-master-calendar', () => ({
  BiddingMasterCalendarPage: (props: {
    selectedResolutionId?: string
    selectedEventId?: string
    drawerTab?: string
  }) => mockPage(props),
}))

import {
  BiddingMasterCalendarRoute,
  Route,
} from './index'

describe('bidding-master-calendar route', () => {
  beforeEach(() => {
    mockPage.mockClear()
    vi.restoreAllMocks()
  })

  it('restores selected drawer state from URL-backed search params', () => {
    vi.spyOn(Route, 'useSearch').mockReturnValue({
      selectedResolutionId: 'bac-resolution-004',
      selectedEventId: 'schedule-bac-resolution-004-bac-resolution-004-ib-posting',
      drawerTab: 'milestones',
    })

    render(<BiddingMasterCalendarRoute />)

    expect(screen.getAllByText('resolution:bac-resolution-004').length).toBeGreaterThan(0)
    expect(
      screen.getAllByText(
        'event:schedule-bac-resolution-004-bac-resolution-004-ib-posting',
      ).length,
    ).toBeGreaterThan(0)
    expect(screen.getAllByText('tab:milestones').length).toBeGreaterThan(0)
  })

  it('leaves drawerTab undefined when the URL restores only the selection ids', () => {
    vi.spyOn(Route, 'useSearch').mockReturnValue({
      selectedResolutionId: 'bac-resolution-004',
      selectedEventId: 'schedule-bac-resolution-004-bac-resolution-004-ib-posting',
      drawerTab: undefined,
    })

    render(<BiddingMasterCalendarRoute />)

    expect(screen.getAllByText('resolution:bac-resolution-004').length).toBeGreaterThan(0)
    expect(screen.getAllByText('tab:none').length).toBeGreaterThan(0)
  })
})