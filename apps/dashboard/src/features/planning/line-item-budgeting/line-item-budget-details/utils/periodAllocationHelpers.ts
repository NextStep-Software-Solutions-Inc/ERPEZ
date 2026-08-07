/**
 * Utilities for period-based budget allocation (Quarterly/Monthly)
 */

export interface DateRange {
  startDate: Date
  endDate: Date
}

export interface QuarterlyAllocation {
  q1: number
  q2: number
  q3: number
  q4: number
}

export interface MonthlyAllocation {
  january: number
  february: number
  march: number
  april: number
  may: number
  june: number
  july: number
  august: number
  september: number
  october: number
  november: number
  december: number
}

export interface PeriodDetails {
  period: string // e.g., "Q1", "January"
  startDate: Date
  endDate: Date
  budget: number
}

export interface AllocationSummary {
  periods: PeriodDetails[]
  totalBudget: number
  nonZeroPeriodCount: number
}

/**
 * Calculate quarterly date ranges based on activity date range
 * If activity spans multiple fiscal years, use the start year as reference
 */
export function calculateQuarterDateRanges(
  activityStartDate: Date,
): Record<string, DateRange> {
  const startYear = activityStartDate.getFullYear()

  // Quarters: Q1=Jan-Mar, Q2=Apr-Jun, Q3=Jul-Sep, Q4=Oct-Dec
  const quarters: Record<string, DateRange> = {
    q1: {
      startDate: new Date(startYear, 0, 1), // Jan 1
      endDate: new Date(startYear, 2, 31), // Mar 31
    },
    q2: {
      startDate: new Date(startYear, 3, 1), // Apr 1
      endDate: new Date(startYear, 5, 30), // Jun 30
    },
    q3: {
      startDate: new Date(startYear, 6, 1), // Jul 1
      endDate: new Date(startYear, 8, 30), // Sep 30
    },
    q4: {
      startDate: new Date(startYear, 9, 1), // Oct 1
      endDate: new Date(startYear, 11, 31), // Dec 31
    },
  }

  return quarters
}

/**
 * Calculate monthly date ranges based on activity date range
 * Returns date ranges for all 12 months in the activity's start year
 */
export function calculateMonthDateRanges(
  activityStartDate: Date,
): Record<string, DateRange> {
  const startYear = activityStartDate.getFullYear()

  const monthNames = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ]

  const months: Record<string, DateRange> = {}

  monthNames.forEach((month, index) => {
    const firstDay = new Date(startYear, index, 1)
    // Last day of month: next month, day 0
    const lastDay = new Date(startYear, index + 1, 0)

    months[month] = {
      startDate: firstDay,
      endDate: lastDay,
    }
  })

  return months
}

/**
 * Convert quarterly allocation to period details
 */
export function generateQuarterlyPeriodDetails(
  allocation: QuarterlyAllocation,
  activityStartDate: Date,
): PeriodDetails[] {
  const quarterRanges = calculateQuarterDateRanges(activityStartDate)
  const quarterLabels = ['Q1', 'Q2', 'Q3', 'Q4']
  const allocationValues = [
    allocation.q1,
    allocation.q2,
    allocation.q3,
    allocation.q4,
  ]

  return allocationValues
    .map((budget, index) => {
      const period = quarterLabels[index]
      const range = quarterRanges[`q${index + 1}`]
      return {
        period,
        startDate: range.startDate,
        endDate: range.endDate,
        budget,
      }
    })
    .filter((detail) => detail.budget > 0) // Only non-zero periods
}

/**
 * Convert monthly allocation to period details
 */
export function generateMonthlyPeriodDetails(
  allocation: MonthlyAllocation,
  activityStartDate: Date,
): PeriodDetails[] {
  const monthRanges = calculateMonthDateRanges(activityStartDate)
  const monthKeys = Object.keys(monthRanges)

  return monthKeys
    .map((monthKey) => {
      const budget = allocation[monthKey as keyof MonthlyAllocation]
      const range = monthRanges[monthKey]
      const capitalizedMonth =
        monthKey.charAt(0).toUpperCase() + monthKey.slice(1)

      return {
        period: capitalizedMonth,
        startDate: range.startDate,
        endDate: range.endDate,
        budget,
      }
    })
    .filter((detail) => detail.budget > 0) // Only non-zero periods
}

/**
 * Generate allocation summary for display
 */
export function generateAllocationSummary(
  periods: PeriodDetails[],
): AllocationSummary {
  const totalBudget = periods.reduce((sum, p) => sum + p.budget, 0)
  const nonZeroPeriodCount = periods.length

  return {
    periods,
    totalBudget,
    nonZeroPeriodCount,
  }
}

/**
 * Format date to ISO string (for API submission)
 */
export function formatDateToISO(date: Date): string {
  return date.toISOString()
}

/**
 * Parse ISO string to Date
 */
export function parseISODate(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Validate that period sum doesn't exceed a maximum budget
 */
export function validatePeriodBudgetSum(
  periods: PeriodDetails[],
  maxBudget: number,
): { valid: boolean; message?: string } {
  const totalBudget = periods.reduce((sum, p) => sum + p.budget, 0)

  if (totalBudget > maxBudget) {
    return {
      valid: false,
      message: `Total budget (₱${totalBudget.toLocaleString()}) exceeds maximum (₱${maxBudget.toLocaleString()})`,
    }
  }

  if (periods.length === 0) {
    return {
      valid: false,
      message: 'At least one period with budget > 0 is required',
    }
  }

  return { valid: true }
}
