/**
 * Distribution Pattern Calculation Utilities
 * Handles monthly cost allocation for non-procurable activities
 */

import type { MonthlyQuantities, Month } from '../types'
import { ALL_MONTHS } from '../types'

export type DistributionPattern =
  | 'even'
  | 'front-loaded'
  | 'back-loaded'
  | 'custom'

/**
 * Calculates monthly allocations based on total cost and distribution pattern
 * @param totalCost - Total cost to distribute across 12 months
 * @param pattern - Distribution pattern type
 * @param existingAllocations - Optional existing custom allocations (for 'custom' pattern)
 * @returns Monthly quantities object
 */
export function calculateMonthlyDistribution(
  totalCost: number,
  pattern: DistributionPattern,
  existingAllocations?: MonthlyQuantities,
): MonthlyQuantities {
  // Initialize empty result
  const result: MonthlyQuantities = ALL_MONTHS.reduce((acc, month) => {
    acc[month] = 0
    return acc
  }, {} as MonthlyQuantities)

  if (totalCost <= 0) return result

  switch (pattern) {
    case 'even': {
      // Distribute evenly across all 12 months
      const monthlyAmount = totalCost / 12
      ALL_MONTHS.forEach((month) => {
        result[month] = monthlyAmount
      })
      return result
    }

    case 'front-loaded': {
      // First 4 months: 60% of cost (15% each)
      // Remaining 8 months: 40% of cost (5% each)
      const frontLoadedAmount = (totalCost * 0.6) / 4
      const backPortionAmount = (totalCost * 0.4) / 8

      ;['jan', 'feb', 'mar', 'apr'].forEach((month) => {
        result[month as Month] = frontLoadedAmount
      })
      ;['may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].forEach(
        (month) => {
          result[month as Month] = backPortionAmount
        },
      )
      return result
    }

    case 'back-loaded': {
      // First 8 months: 40% of cost (5% each)
      // Last 4 months: 60% of cost (15% each)
      const frontPortionAmount = (totalCost * 0.4) / 8
      const backLoadedAmount = (totalCost * 0.6) / 4

      ;['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug'].forEach(
        (month) => {
          result[month as Month] = frontPortionAmount
        },
      )
      ;['sep', 'oct', 'nov', 'dec'].forEach((month) => {
        result[month as Month] = backLoadedAmount
      })
      return result
    }

    case 'custom': {
      // Return existing allocations or default to empty
      return existingAllocations || result
    }

    default:
      return result
  }
}

/**
 * Sums all monthly allocations
 * @param allocations - Monthly quantities to sum
 * @returns Total of all months
 */
export function sumMonthlyAllocations(allocations: MonthlyQuantities): number {
  return ALL_MONTHS.reduce((sum, month) => sum + (allocations[month] || 0), 0)
}

/**
 * Checks if monthly allocations exceed budget limit
 * @param allocations - Monthly quantities
 * @param budgetLimit - Budget limit to check against
 * @returns true if sum of allocations > budget limit
 */
export function isOverBudget(
  allocations: MonthlyQuantities,
  budgetLimit: number,
): boolean {
  return sumMonthlyAllocations(allocations) > budgetLimit
}

/**
 * Calculates percentage of each month relative to total
 * @param allocations - Monthly quantities
 * @returns Object with percentage for each month
 */
export function calculateMonthlyPercentages(
  allocations: MonthlyQuantities,
): Record<string, number> {
  const total = sumMonthlyAllocations(allocations)
  if (total === 0)
    return ALL_MONTHS.reduce((acc, m) => ({ ...acc, [m]: 0 }), {})

  return ALL_MONTHS.reduce(
    (acc, month) => {
      acc[month] = (allocations[month] / total) * 100
      return acc
    },
    {} as Record<string, number>,
  )
}
