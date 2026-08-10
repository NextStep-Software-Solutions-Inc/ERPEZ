import {
  differenceInCalendarDays,
  isBefore,
  parseISO,
  startOfDay,
} from 'date-fns'
import type { BiddingScheduleStatus } from '../../bidding-schedule/types'
import type { DerivedCalendarProjectStatus } from '../types'

export function deriveProjectStatus(
  eventDates: string[],
  scheduleStatus: BiddingScheduleStatus,
  today = new Date(),
): DerivedCalendarProjectStatus {
  if (scheduleStatus === 'locked') {
    return 'completed-locked'
  }

  const todayStart = startOfDay(today)
  const parsedDates = eventDates
    .map((value) => parseISO(value))
    .sort((left, right) => left.getTime() - right.getTime())

  if (parsedDates.length === 0) {
    return 'upcoming'
  }

  const hasPastEvents = parsedDates.some((value) => isBefore(value, todayStart))
  const nextUpcoming = parsedDates.find((value) => !isBefore(value, todayStart))

  if (!nextUpcoming) {
    return 'overdue'
  }

  const daysUntilNext = differenceInCalendarDays(nextUpcoming, todayStart)

  if (daysUntilNext <= 7) {
    return 'due-soon'
  }

  if (hasPastEvents) {
    return 'in-progress'
  }

  return 'upcoming'
}
