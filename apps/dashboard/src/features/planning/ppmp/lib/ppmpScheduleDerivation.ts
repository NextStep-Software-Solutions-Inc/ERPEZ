import type { AllocationMonth } from '../types'

export const PPMP_ALLOCATION_MONTHS: AllocationMonth[] = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export interface DeriveScheduleDatesParams {
  monthlyQuantities: Record<AllocationMonth, number>
  fiscalYear?: number | string
  procurementModeName?: string
  clampToFiscalYear?: boolean
}

export interface DerivedScheduleDates {
  expectedDeliveryStart: string
  expectedDeliveryEnd: string
  procurementStartDate: string
  procurementEndDate: string
}

/**
 * Derives the Expected Delivery Window and Procurement Schedule based on monthly allocations.
 *
 * Rules:
 * 1. Delivery Window:
 *    - expectedDeliveryStart: 1st day of earliest allocated month (e.g. YYYY-01-01)
 *    - expectedDeliveryEnd: Last day of latest allocated month (e.g. YYYY-10-31)
 * 2. Procurement Schedule:
 *    - Back-calculated based on mode-aware lead times (e.g. 30 days for Public Bidding, 15 days for Alternative Modes/SVP).
 *    - procurementEndDate is set to the day before delivery starts (or same day if delivery starts Jan 1).
 *    - procurementStartDate is set to procurementEndDate minus lead time, clamped to Jan 1 of fiscal year when clampToFiscalYear is true.
 *    - Guarantees: procurementStartDate <= procurementEndDate <= expectedDeliveryStart <= expectedDeliveryEnd.
 */
export function deriveScheduleDates({
  monthlyQuantities,
  fiscalYear,
  procurementModeName,
  clampToFiscalYear = true,
}: DeriveScheduleDatesParams): DerivedScheduleDates | null {
  const targetYear = Number(fiscalYear) || new Date().getFullYear()

  // Find all months with quantity > 0
  const activeMonths = PPMP_ALLOCATION_MONTHS.map((m, idx) => ({
    month: m,
    idx,
    qty: monthlyQuantities[m] || 0,
  })).filter((x) => x.qty > 0)

  if (activeMonths.length === 0) {
    return null
  }

  const earliestMonthIdx = activeMonths[0].idx
  const latestMonthIdx = activeMonths[activeMonths.length - 1].idx

  // Delivery Start: 1st day of earliest month (UTC-safe YYYY-MM-DD string)
  const earliestMonthStr = String(earliestMonthIdx + 1).padStart(2, '0')
  const deliveryStart = `${targetYear}-${earliestMonthStr}-01`

  // Delivery End: Last day of latest month (UTC-safe YYYY-MM-DD string)
  const lastDay = new Date(Date.UTC(targetYear, latestMonthIdx + 1, 0)).getUTCDate()
  const latestMonthStr = String(latestMonthIdx + 1).padStart(2, '0')
  const deliveryEnd = `${targetYear}-${latestMonthStr}-${String(lastDay).padStart(2, '0')}`

  // Lead time based on procurement mode
  const isPublicBidding = procurementModeName
    ? /bidding|public|competitive/i.test(procurementModeName)
    : false
  const leadTimeDays = isPublicBidding ? 30 : 15

  // Procurement End Date: Day before delivery starts (or Jan 1 if delivery starts on Jan 1)
  let procEndDate: Date
  if (earliestMonthIdx === 0) {
    // January delivery: procurement concludes on Jan 1 to prevent cross-year constraint violations
    procEndDate = new Date(Date.UTC(targetYear, 0, 1))
  } else {
    // Last day of the preceding month
    procEndDate = new Date(Date.UTC(targetYear, earliestMonthIdx, 0))
  }

  // Procurement Start Date: procEndDate minus (leadTimeDays - 1)
  const procStartDate = new Date(procEndDate.getTime())
  procStartDate.setUTCDate(procStartDate.getUTCDate() - (leadTimeDays - 1))

  // Clamp to start of fiscal year if requested
  if (clampToFiscalYear) {
    const minFiscalDate = new Date(Date.UTC(targetYear, 0, 1))
    if (procStartDate < minFiscalDate) {
      procStartDate.setTime(minFiscalDate.getTime())
    }
  }

  // Ensure procStartDate <= procEndDate
  if (procStartDate > procEndDate) {
    procStartDate.setTime(procEndDate.getTime())
  }

  const formatIsoUtc = (d: Date) => {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, '0')
    const day = String(d.getUTCDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  return {
    expectedDeliveryStart: deliveryStart,
    expectedDeliveryEnd: deliveryEnd,
    procurementStartDate: formatIsoUtc(procStartDate),
    procurementEndDate: formatIsoUtc(procEndDate),
  }
}

/**
 * Fallback schedule when monthly allocations are not enabled or all zero.
 * Default procurement: Jan 1 to Jan 15 of fiscal year.
 * Default delivery window: Jan 16 to Dec 31 of fiscal year.
 * Guarantees valid timeline ordering without validation friction.
 */
export function getFiscalYearDefaultDates(fiscalYear?: number | string): DerivedScheduleDates {
  const year = Number(fiscalYear) || new Date().getFullYear()
  return {
    procurementStartDate: `${year}-01-01`,
    procurementEndDate: `${year}-01-15`,
    expectedDeliveryStart: `${year}-01-16`,
    expectedDeliveryEnd: `${year}-12-31`,
  }
}
