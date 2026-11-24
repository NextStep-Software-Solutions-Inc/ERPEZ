import { describe, expect, it } from 'vitest'
import { DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS } from '../types'
import {
  aggregateScheduleEvents,
  applyCalendarFilters,
  buildAgendaGroups,
  buildAppMonthBands,
  detectCalendarConflicts,
} from '.'

const TODAY = new Date('2026-05-20T00:00:00.000Z')

function buildCalendarFixture() {
  const resolutions = [] as any[] // Placeholder for resolutions, replace with actual data source if available
  const schedules = [] as any[] // Placeholder for schedules, replace with actual data source if available
  const appBands = buildAppMonthBands(resolutions)
  const events = aggregateScheduleEvents({
    schedules,
    resolutions,
    appBands,
    today: TODAY,
  })

  return { resolutions, schedules, appBands, events }
}

describe('biddingMasterCalendar data engine', () => {
  it('detects same-type conflicts across different schedules', () => {
    const { events } = buildCalendarFixture()
    const conflicts = detectCalendarConflicts(events)

    const ibPostingConflict = conflicts.find(
      (conflict) =>
        conflict.date === '2026-05-22' &&
        conflict.milestoneKey === 'bid-submission-opening',
    )

    expect(ibPostingConflict).toBeDefined()
    expect(
      ibPostingConflict?.events.map((event) => event.bacResolutionId),
    ).toEqual(
      expect.arrayContaining(['bac-resolution-009', 'bac-resolution-010']),
    )
  })

  it('marks overloaded agenda days independently of conflict groups', () => {
    const { events, appBands } = buildCalendarFixture()
    const agendaGroups = buildAgendaGroups(events, appBands)

    const overloadedOnlyDay = agendaGroups.find(
      (group) => group.date === '2026-05-15',
    )

    expect(overloadedOnlyDay).toBeDefined()
    expect(overloadedOnlyDay?.bucket.isOverloaded).toBe(true)
    expect(overloadedOnlyDay?.bucket.hardConflictCount).toBe(0)
  })

  it('derives due-soon and locked statuses for seeded schedules', () => {
    const { events } = buildCalendarFixture()

    const confirmedScheduleEvent = events.find(
      (event) => event.bacResolutionId === 'bac-resolution-006',
    )
    const lockedScheduleEvent = events.find(
      (event) => event.bacResolutionId === 'bac-resolution-007',
    )

    expect(confirmedScheduleEvent?.derivedProjectStatus).toBe('due-soon')
    expect(lockedScheduleEvent?.derivedProjectStatus).toBe('completed-locked')
  })

  it('includes draft schedules in the master calendar data', () => {
    const { events } = buildCalendarFixture()

    const draftScheduleEvent = events.find(
      (event) =>
        event.bacResolutionId === 'bac-resolution-005' &&
        event.scheduleStatus === 'draft',
    )

    expect(draftScheduleEvent).toBeDefined()
    expect(draftScheduleEvent?.sourceType).toBe('draft')
  })

  it('applies stable screenshot-style project title overrides', () => {
    const { events } = buildCalendarFixture()

    const projectEvent = events.find(
      (event) => event.bacResolutionId === 'bac-resolution-006',
    )

    expect(projectEvent?.primaryProjectName).toBe('Data center cooling upgrade')
    expect(projectEvent?.officeLabel).toBe('ICT Office')
  })

  it('filters aggregated events across text, facet, and date criteria', () => {
    const { events } = buildCalendarFixture()

    const filtered = applyCalendarFilters(events, {
      ...DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
      searchTerm: 'road rehabilitation',
      milestoneKeys: ['ib-posting'],
      procurementCategories: ['goods'],
      offices: ['Dept. of Public Works'],
      derivedStatuses: ['due-soon'],
      fiscalYears: ['2026'],
      dateRangeStart: '2026-05-22',
      dateRangeEnd: '2026-05-22',
    })

    expect(filtered.length).toBeGreaterThan(0)
    expect(
      filtered.every(
        (event) =>
          event.primaryProjectName === 'Road rehabilitation — Phase 1' &&
          event.milestoneKey === 'ib-posting' &&
          event.officeLabel === 'Dept. of Public Works' &&
          event.derivedProjectStatus === 'due-soon' &&
          event.eventDate === '2026-05-22',
      ),
    ).toBe(true)
  })

  it('filters aggregated events across text, facet, and date criteria', () => {
    const { events } = buildCalendarFixture()

    const filtered = applyCalendarFilters(events, {
      ...DEFAULT_BIDDING_MASTER_CALENDAR_FILTERS,
      searchTerm: 'road rehabilitation',
      milestoneKeys: ['ib-posting'],
      procurementCategories: ['goods'],
      offices: ['Dept. of Public Works'],
      derivedStatuses: ['due-soon'],
      fiscalYears: ['2026'],
      dateRangeStart: '2026-05-22',
      dateRangeEnd: '2026-05-22',
    })

    expect(filtered.length).toBeGreaterThan(0)
    expect(
      filtered.every(
        (event) =>
          event.primaryProjectName === 'Road rehabilitation — Phase 1' &&
          event.milestoneKey === 'ib-posting' &&
          event.officeLabel === 'Dept. of Public Works' &&
          event.derivedProjectStatus === 'due-soon' &&
          event.eventDate === '2026-05-22',
      ),
    ).toBe(true)
  })
})
