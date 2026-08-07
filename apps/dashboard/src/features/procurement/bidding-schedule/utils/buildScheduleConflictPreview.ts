import { format, parseISO } from 'date-fns'
import type { BiddingSchedule } from '../types'

export type ScheduleConflictPreview = {
  hardConflicts: Array<{
    date: string
    milestoneName: string
    otherResolutionNumbers: string[]
  }>
  overloadedDates: Array<{
    date: string
    eventCount: number
  }>
}

function getResolvedDate(milestone: BiddingSchedule['milestones'][number]) {
  return milestone.overrideDate ?? milestone.computedDate
}

export function buildScheduleConflictPreview({
  schedule,
  otherSchedules,
}: {
  schedule: BiddingSchedule
  otherSchedules: BiddingSchedule[]
}): ScheduleConflictPreview {
  const hardConflicts = schedule.milestones.flatMap((milestone) => {
    const eventDate = getResolvedDate(milestone)
    const collidingSchedules = otherSchedules.filter((candidate) =>
      candidate.milestones.some(
        (candidateMilestone) =>
          candidateMilestone.milestoneKey === milestone.milestoneKey &&
          getResolvedDate(candidateMilestone) === eventDate,
      ),
    )

    if (collidingSchedules.length === 0) {
      return []
    }

    return [
      {
        date: format(parseISO(eventDate), 'MMM d, yyyy'),
        milestoneName: milestone.name,
        otherResolutionNumbers: collidingSchedules.map(
          (candidate) => candidate.bacResolutionNumber,
        ),
      },
    ]
  })

  const dateCounts = new Map<string, number>()

  for (const milestone of schedule.milestones) {
    const eventDate = getResolvedDate(milestone)
    dateCounts.set(eventDate, (dateCounts.get(eventDate) ?? 0) + 1)
  }

  for (const candidate of otherSchedules) {
    for (const milestone of candidate.milestones) {
      const eventDate = getResolvedDate(milestone)
      dateCounts.set(eventDate, (dateCounts.get(eventDate) ?? 0) + 1)
    }
  }

  const overloadedDates = schedule.milestones
    .map((milestone) => getResolvedDate(milestone))
    .filter((date, index, dates) => dates.indexOf(date) === index)
    .map((date) => ({
      date: format(parseISO(date), 'MMM d, yyyy'),
      eventCount: dateCounts.get(date) ?? 0,
    }))
    .filter((item) => item.eventCount >= 3)

  return {
    hardConflicts,
    overloadedDates,
  }
}
