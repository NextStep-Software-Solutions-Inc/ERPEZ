import {
  differenceInCalendarDays,
  format,
  parse,
  parseISO,
  startOfDay,
} from 'date-fns'
import { getMinimumAllowableDate } from './dateHelpers'
import type {
  BiddingMilestone,
  Holiday,
  MilestoneExecutionStatus,
} from '../types'

export function getEffectiveMilestoneDate(
  milestone: Pick<BiddingMilestone, 'overrideDate' | 'computedDate'>,
) {
  return milestone.overrideDate ?? milestone.computedDate
}

export function getAllowedWindow({
  previousEffectiveDate,
  minDaysFromPrevious,
  maxDaysFromPrevious,
  holidays,
}: {
  previousEffectiveDate: string
  minDaysFromPrevious: number
  maxDaysFromPrevious: number | null
  holidays: Array<Holiday>
}) {
  const start = getMinimumAllowableDate(
    previousEffectiveDate,
    minDaysFromPrevious,
    holidays,
  )
  const end =
    maxDaysFromPrevious === null
      ? start
      : getMinimumAllowableDate(
          previousEffectiveDate,
          maxDaysFromPrevious,
          holidays,
        )

  return { start, end }
}

export function resolveMilestoneExecutionStatus(
  milestone: Pick<
    BiddingMilestone,
    'completedAt' | 'overrideDate' | 'computedDate'
  >,
  today: Date = new Date(),
): MilestoneExecutionStatus {
  if (milestone.completedAt) {
    return 'completed'
  }

  const effectiveDate = getEffectiveMilestoneDate(milestone)
  const dayDelta = differenceInCalendarDays(
    parseISO(effectiveDate),
    startOfDay(today),
  )

  if (dayDelta < 0) {
    return 'overdue'
  }

  if (dayDelta <= 7) {
    return 'due-soon'
  }

  return 'pending'
}

export function getMilestoneExecutionTone(status: MilestoneExecutionStatus) {
  switch (status) {
    case 'completed':
      return 'success' as const
    case 'overdue':
      return 'destructive' as const
    case 'due-soon':
      return 'warning' as const
    default:
      return 'secondary' as const
  }
}

export function getMilestoneExecutionLabel(status: MilestoneExecutionStatus) {
  switch (status) {
    case 'due-soon':
      return 'Due Soon'
    case 'overdue':
      return 'Overdue'
    case 'completed':
      return 'Completed'
    default:
      return 'Pending'
  }
}

export function formatScheduleTime(time: string | null) {
  if (!time) {
    return null
  }

  try {
    return format(parse(time, 'HH:mm', new Date()), 'h:mm a')
  } catch {
    return time
  }
}
