import { addDays, format, isWeekend, parseISO } from 'date-fns'
import { isHoliday } from './dateHelpers'
import type { BiddingMilestone, Holiday, IntervalConfig } from '../types'

/**
 * Computes all milestone dates from Day 0.
 *
 * Algorithm per RA 9184 acceptance criteria (order matters):
 *   Milestone 0 → ibPostingDate directly.
 *   Each subsequent milestone:
 *     1. addDays(previousDate, minDaysFromPrevious)  ← add days FIRST
 *     2. while isWeekend || isHoliday → advance +1   ← skip non-working days AFTER
 */
export function computeMilestones(
  ibPostingDate: string,
  config: IntervalConfig,
  holidays: Array<Holiday>,
): Array<BiddingMilestone> {
  const milestones: Array<BiddingMilestone> = []
  let previousDate: Date = parseISO(ibPostingDate)

  for (const intervalEntry of config.milestones) {
    let computedDate: string

    if (intervalEntry.order === 0) {
      // Day 0 anchor — use ibPostingDate as-is
      computedDate = ibPostingDate
      previousDate = parseISO(ibPostingDate)
    } else {
      // Step 1: add days first
      let candidate = addDays(previousDate, intervalEntry.minDaysFromPrevious)
      // Step 2: skip weekends and holidays
      while (isWeekend(candidate) || isHoliday(candidate, holidays)) {
        candidate = addDays(candidate, 1)
      }
      computedDate = format(candidate, 'yyyy-MM-dd')
      previousDate = candidate
    }

    milestones.push({
      id: `milestone-${intervalEntry.milestoneKey}-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}-${intervalEntry.order}`,
      order: intervalEntry.order,
      milestoneKey: intervalEntry.milestoneKey,
      name: intervalEntry.milestoneName,
      computedDate,
      overrideDate: null,
      time: null,
      status: 'auto-generated',
      isEdited: false,
      completedAt: null,
      completedBy: null,
      editHistory: [],
    })
  }

  return milestones
}
