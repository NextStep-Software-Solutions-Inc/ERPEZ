import type { BiddingMasterCalendarEvent } from '../types'

export interface OverloadedDay {
  date: string
  eventCount: number
}

export function detectOverloadedDays(
  events: BiddingMasterCalendarEvent[],
  threshold = 3,
): OverloadedDay[] {
  const grouped = new Map<string, number>()

  for (const event of events) {
    grouped.set(event.eventDate, (grouped.get(event.eventDate) ?? 0) + 1)
  }

  return Array.from(grouped.entries())
    .filter(([, count]) => count >= threshold)
    .map(([date, eventCount]) => ({ date, eventCount }))
}
