import { useMemo } from 'react'
import { useBiddingScheduleStore } from '../../bidding-schedule/store/biddingScheduleStore'
import {
  aggregateScheduleEvents,
  applyCalendarFilters,
  buildAgendaGroups,
  buildAppMonthBands,
} from '../utils'
import type { BiddingMasterCalendarFilters } from '../types'

export function useBiddingMasterCalendarData(
  filters: BiddingMasterCalendarFilters,
  refreshToken = 0,
) {
  const liveSchedules = useBiddingScheduleStore((state) => state.schedules)

  return useMemo(() => {
    const allSchedules = liveSchedules
    const sourceSchedules = allSchedules
    const resolutions = [] as any[] // Placeholder for resolutions, replace with actual data source if available
    const appBands = buildAppMonthBands(resolutions)
    const events = aggregateScheduleEvents({
      schedules: sourceSchedules,
      resolutions,
      appBands,
    })
    const filteredEvents = applyCalendarFilters(events, filters)
    const agendaGroups = buildAgendaGroups(filteredEvents, appBands)
    const summary = {
      totalSchedules: new Set(
        filteredEvents.map((event) => event.bacResolutionId),
      ).size,
      totalVisibleMilestones: filteredEvents.length,
      conflictDays: agendaGroups.filter(
        (group) => group.bucket.hardConflictCount > 0,
      ).length,
      overloadedDays: agendaGroups.filter((group) => group.bucket.isOverloaded)
        .length,
      dueSoonItems: filteredEvents.filter((event) => event.isDueSoon).length,
      overdueItems: filteredEvents.filter((event) => event.isOverdue).length,
    }

    return {
      sourceSchedules,
      resolutions,
      appBands,
      events,
      filteredEvents,
      agendaGroups,
      dayBuckets: agendaGroups.map((group) => group.bucket),
      summary,
      options: {
        milestoneOptions: Array.from(
          new Map(
            events.map((event) => [event.milestoneKey, event.milestoneName]),
          ).entries(),
        ).map(([value, label]) => ({ value, label })),
        officeOptions: Array.from(
          new Set(events.map((event) => event.officeLabel)),
        ).sort(),
        fiscalYearOptions: Array.from(
          new Set(events.map((event) => event.fiscalYear)),
        ).sort(),
      },
    }
  }, [filters, liveSchedules, refreshToken])
}
