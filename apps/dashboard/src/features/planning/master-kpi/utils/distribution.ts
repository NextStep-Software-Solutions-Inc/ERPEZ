import { TargetDistributionBehavior } from '../types'

/**
 * KPI Calculation & Distribution Utilities
 * Implements the logic described in the Acceptance Criteria for Master KPIs
 */

/**
 * API-side distribution behavior string values as sent/received by the backend.
 */
export type ApiDistributionBehavior =
  | 'Summation'
  | 'Divisible'
  | 'Uniform'
  | 'Milestone'
  | 'Maximum'
  | 'Minimum'

/**
 * Maps an API distributionBehavior string to the internal TargetDistributionBehavior enum.
 * Uses exact string matching so that API values like "Summation" and "Divisible" are
 * correctly distinguished rather than falling through to a single catch-all.
 *
 * @param apiValue The raw distributionBehavior string from the API response
 * @returns The matching TargetDistributionBehavior, or undefined when unrecognised
 */
export function mapDistributionBehavior(
  apiValue: ApiDistributionBehavior | null | undefined,
): TargetDistributionBehavior | undefined {
  if (!apiValue) return undefined
  switch (apiValue) {
    case 'Summation':
      return TargetDistributionBehavior.SUMMATION
    case 'Divisible':
      return TargetDistributionBehavior.DIVISIBLE_SUMMATIVE
    case 'Uniform':
      return TargetDistributionBehavior.UNIFORM_AVERAGE
    case 'Milestone':
      return TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE
    case 'Maximum':
      return TargetDistributionBehavior.MAXIMUM
    case 'Minimum':
      return TargetDistributionBehavior.MINIMUM
    default:
      return undefined
  }
}

/**
 * Maps an internal TargetDistributionBehavior enum value to the API distributionBehavior
 * string. Each enum value is mapped 1:1 to its corresponding API representation so that
 * the backend receives the correct value regardless of measurement unit.
 *
 * @param behavior The internal distribution behavior enum value
 * @returns The corresponding API string
 */
export function mapDistributionBehaviorToApi(
  behavior: TargetDistributionBehavior,
): ApiDistributionBehavior {
  switch (behavior) {
    case TargetDistributionBehavior.SUMMATION:
      return 'Summation'
    case TargetDistributionBehavior.DIVISIBLE_SUMMATIVE:
      return 'Divisible'
    case TargetDistributionBehavior.UNIFORM_AVERAGE:
      return 'Uniform'
    case TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE:
      return 'Milestone'
    case TargetDistributionBehavior.MAXIMUM:
      return 'Maximum'
    case TargetDistributionBehavior.MINIMUM:
      return 'Minimum'
  }
}

/**
 * Calculates a final score based on target distribution behavior
 * Used for "Going Up" (Performance Review) aggregation
 *
 * @param values Array of actual result values from different offices/units
 * @param behavior The specified distribution behavior
 * @returns The aggregated final result
 */
export const aggregateResults = (
  values: number[],
  behavior: TargetDistributionBehavior,
): number => {
  if (values.length === 0) return 0

  switch (behavior) {
    case TargetDistributionBehavior.SUMMATION:
    case TargetDistributionBehavior.DIVISIBLE_SUMMATIVE:
      // Summative: Total agency goal is a sum of its parts (e.g., Number of Startups)
      return values.reduce((sum, val) => sum + val, 0)

    case TargetDistributionBehavior.UNIFORM_AVERAGE: {
      // Average: Recalculates total pool (e.g., Budget Utilization Rate %)
      const sum = values.reduce((acc, val) => acc + val, 0)
      return sum / values.length
    }

    case TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE:
      // Milestone: Grades are usually individual (Pass/Fail/Rating)
      // For aggregation, we might take the average rating or max compliance
      // Typically, milestones are evaluated individually, but if we must sum:
      // Return the average for a "Global" view, or custom logic can be added
      return values.reduce((sum, val) => sum + val, 0) / values.length

    default:
      return 0
  }
}

/**
 * Validates if a target distribution is mathematically sound
 * Used for "Going Down" (Target Setting) validation
 *
 * @param parentTarget The total agency commitment
 * @param childTargets The individual targets assigned to offices
 * @param behavior The specified distribution behavior
 * @returns boolean indicating if the distribution is valid
 */
export const validateTargetDistribution = (
  parentTarget: number,
  childTargets: number[],
  behavior: TargetDistributionBehavior,
): boolean => {
  switch (behavior) {
    case TargetDistributionBehavior.SUMMATION:
    case TargetDistributionBehavior.DIVISIBLE_SUMMATIVE: {
      // Sum must equal parent (e.g., 12 + 8 = 20)
      const total = childTargets.reduce((sum, val) => sum + val, 0)
      return Math.abs(total - parentTarget) < 0.000001 // Floating point safety
    }

    case TargetDistributionBehavior.UNIFORM_AVERAGE:
      // Each child should ideally match the parent (e.g., all get 80%)
      // In some cases, avg could match, but typically it is assigned uniformly
      return childTargets.every((t) => t === parentTarget)

    case TargetDistributionBehavior.MILESTONE_NON_DIVISIBLE:
      // Every office gets the same event target (usually "1")
      return childTargets.every((t) => t === parentTarget)

    default:
      return true
  }
}
