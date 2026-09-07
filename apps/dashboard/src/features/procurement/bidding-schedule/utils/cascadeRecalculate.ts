import { addDays, format, isWeekend, parseISO } from 'date-fns'
import { isHoliday } from './dateHelpers'
import type { BiddingMilestone, Holiday, IntervalConfig } from '../types'

/**
 * Recalculates `computedDate` for every milestone after `changedIndex`,
 * propagating the effect of an upstream manual override forward.
 *
 * Rules:
 * - The effective date of a milestone is `overrideDate ?? computedDate`.
 * - `overrideDate` on downstream milestones is intentionally preserved
 *   (audit trail must not be discarded).
 * - Returns a new array; the input is never mutated.
 */
export function cascadeRecalculate(
  milestones: Array<BiddingMilestone>,
  changedIndex: number,
  config: IntervalConfig,
  holidays: Array<Holiday>,
): Array<BiddingMilestone> {
  // Shallow clone — we'll replace individual elements below
  const updated = milestones.map((m) => ({ ...m }))

  for (let i = changedIndex + 1; i < updated.length; i++) {
    const previous = updated[i - 1]
    const previousEffective = previous.overrideDate ?? previous.computedDate

    const intervalEntry = config.milestones[i]
    if (!intervalEntry) {
      throw new Error(
        `Missing milestone config for recalculation at index ${i}.`,
      )
    }

    // Step 1: add days first
    let candidate = addDays(
      parseISO(previousEffective),
      intervalEntry.minDaysFromPrevious,
    )
    // Step 2: skip weekends and holidays
    while (isWeekend(candidate) || isHoliday(candidate, holidays)) {
      candidate = addDays(candidate, 1)
    }

    updated[i] = {
      ...updated[i],
      computedDate: format(candidate, 'yyyy-MM-dd'),
    }
  }

  return updated
}
