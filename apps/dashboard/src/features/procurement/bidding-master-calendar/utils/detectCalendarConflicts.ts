import type {
  BiddingMasterCalendarConflictGroup,
  BiddingMasterCalendarEvent,
} from '../types'

export function detectCalendarConflicts(
  events: BiddingMasterCalendarEvent[],
): BiddingMasterCalendarConflictGroup[] {
  const grouped = new Map<string, BiddingMasterCalendarEvent[]>()

  for (const event of events) {
    const key = `${event.eventDate}::${event.milestoneKey}`
    const existing = grouped.get(key) ?? []
    existing.push(event)
    grouped.set(key, existing)
  }

  return Array.from(grouped.entries())
    .map(([key, groupedEvents]) => {
      const bacResolutionIds = new Set(
        groupedEvents.map((event) => event.bacResolutionId),
      )

      if (groupedEvents.length < 2 || bacResolutionIds.size < 2) {
        return null
      }

      const [date, milestoneKey] = key.split('::')

      return {
        date,
        milestoneKey,
        milestoneName: groupedEvents[0]?.milestoneName ?? milestoneKey,
        events: groupedEvents.sort((left, right) =>
          left.bacResolutionNumber.localeCompare(right.bacResolutionNumber),
        ),
      }
    })
    .filter(
      (group): group is BiddingMasterCalendarConflictGroup => group !== null,
    )
}
