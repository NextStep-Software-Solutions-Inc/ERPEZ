import {
  addDays,
  format,
  isAfter,
  isBefore,
  isWeekend,
  parseISO,
} from 'date-fns'
import type { Holiday } from '../types'

/**
 * Returns true if `date` falls on a declared holiday.
 * Comparison is done in YYYY-MM-DD string space to avoid timezone drift.
 */
export function isHoliday(date: Date, holidays: Array<Holiday>): boolean {
  const key = format(date, 'yyyy-MM-dd')
  return holidays.some((h) => h.date === key)
}

/**
 * Computes the earliest legal working date that is at least `minDaysFromPrevious`
 * calendar days after `previousEffectiveDate`.
 *
 * Algorithm (must match computeMilestones):
 *   1. Add the minimum days first.
 *   2. Then advance past any weekends / holidays.
 *
 * Returns a `Date` so callers can use it directly as a date-picker lower bound.
 */
export function getMinimumAllowableDate(
  previousEffectiveDate: string,
  minDaysFromPrevious: number,
  holidays: Array<Holiday>,
): Date {
  let candidate: Date = addDays(
    parseISO(previousEffectiveDate),
    minDaysFromPrevious,
  )
  while (isWeekend(candidate) || isHoliday(candidate, holidays)) {
    candidate = addDays(candidate, 1)
  }
  return candidate
}

/**
 * Returns a predicate suitable for `react-day-picker`'s `disabled` prop.
 * A date is disabled when it is:
 *   - before `minimumDate`
 *   - a weekend
 *   - a declared holiday
 */
export function buildDisabledMatcher(
  minimumDate: Date,
  holidays: Array<Holiday>,
  maximumDate?: Date,
): (date: Date) => boolean {
  return (date: Date) =>
    isBefore(date, minimumDate) ||
    (maximumDate ? isAfter(date, maximumDate) : false) ||
    isWeekend(date) ||
    isHoliday(date, holidays)
}
