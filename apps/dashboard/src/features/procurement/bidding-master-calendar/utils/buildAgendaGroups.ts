import { format, parseISO } from 'date-fns'
import { detectCalendarConflicts } from './detectCalendarConflicts'
import { detectOverloadedDays } from './detectOverloadedDays'
import type {
  BiddingMasterCalendarAgendaGroup,
  BiddingMasterCalendarAppBand,
  BiddingMasterCalendarDayBucket,
  BiddingMasterCalendarEvent,
} from '../types'

function sortEvents(events: BiddingMasterCalendarEvent[]) {
  return [...events].sort((left, right) => {
    const leftTime = left.eventTime ?? '23:59'
    const rightTime = right.eventTime ?? '23:59'

    if (leftTime !== rightTime) {
      return leftTime.localeCompare(rightTime)
    }

    if (left.milestoneOrder !== right.milestoneOrder) {
      return left.milestoneOrder - right.milestoneOrder
    }

    return left.bacResolutionNumber.localeCompare(right.bacResolutionNumber)
  })
}

export function buildAgendaGroups(
  events: BiddingMasterCalendarEvent[],
  appBands: BiddingMasterCalendarAppBand[],
): BiddingMasterCalendarAgendaGroup[] {
  const grouped = new Map<string, BiddingMasterCalendarEvent[]>()
  const conflicts = detectCalendarConflicts(events)
  const overloads = new Map(
    detectOverloadedDays(events).map((item) => [item.date, item.eventCount]),
  )
  const conflictsByDate = new Map<string, typeof conflicts>()

  for (const conflict of conflicts) {
    const existing = conflictsByDate.get(conflict.date) ?? []
    existing.push(conflict)
    conflictsByDate.set(conflict.date, existing)
  }

  for (const event of events) {
    const existing = grouped.get(event.eventDate) ?? []
    existing.push(event)
    grouped.set(event.eventDate, existing)
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, dayEvents]) => {
      const bucket: BiddingMasterCalendarDayBucket = {
        date,
        events: sortEvents(dayEvents),
        hardConflictGroups: conflictsByDate.get(date) ?? [],
        hardConflictCount: conflictsByDate.get(date)?.length ?? 0,
        isOverloaded: overloads.has(date),
        overloadCount: overloads.get(date) ?? dayEvents.length,
        appBands: appBands.filter((band) => band.monthKey === date.slice(0, 7)),
        dueSoonCount: dayEvents.filter((event) => event.isDueSoon).length,
        overdueCount: dayEvents.filter((event) => event.isOverdue).length,
      }

      return {
        date,
        label: format(parseISO(date), 'EEEE, MMM d, yyyy'),
        bucket,
      }
    })
}
