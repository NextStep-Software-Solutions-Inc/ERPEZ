/**
 * Annual Performance Planning (APP) Utility Functions - CONSOLIDATED
 * 
 * Merged calculation logic for:
 * - Phase 1: Fiscal Year Management & Date Range Conflict Detection
 * - Phase 2: KPI Activation & Snapshot Simulation
 * - Phase 3: Target Distribution & Auto-Spread & Dynamic Totals
 */

// ============================================================================
// Types & Constants
// ============================================================================

/**
 * Aggregation Types for KPI Calculations
 * 
 * - Sum: Quarters add up to Annual (e.g., 100 → 25+25+25+25)
 * - Average: Quarters equal Annual (e.g., 90% → 90,90,90,90)
 * - Fixed: Binary/One-time achievement (e.g., ISO Certification)
 */
export type AggregationType = 'Sum' | 'Average' | 'Fixed'

export interface QuarterlyValues {
  q1: number
  q2: number
  q3: number
  q4: number
}

export interface AnnualCalculationResult {
  annual: number
  q1: number
  q2: number
  q3: number
  q4: number
  aggregationType: AggregationType
}

export interface VarianceCheckResult {
  isValid: boolean
  variance: number
  percentage: number
  warning: string | null
}

// ============================================================================
// CORE CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate Annual Total from Quarterly Values
 * 
 * Uses aggregation type to determine formula:
 * - Sum: q1 + q2 + q3 + q4
 * - Average: (q1 + q2 + q3 + q4) / 4
 * - Fixed: Uses q1 value (others ignored)
 * 
 * Supports both array and object input formats.
 * 
 * @param aggregationType - 'Sum' | 'Average' | 'Fixed'
 * @param quarterlyValuesOrQ1 - Array [q1, q2, q3, q4], object with q1-q4, or first quarterly value
 * @param q2 - Second quarterly value (if first param is q1)
 * @param q3 - Third quarterly value (if first param is q1)
 * @param q4 - Fourth quarterly value (if first param is q1)
 * @returns Calculated annual value
 * @example
 * // Array format
 * calculateAnnual('Sum', [25, 25, 25, 25]) // 100
 * 
 * // Object format
 * calculateAnnual('Sum', { q1: 25, q2: 25, q3: 25, q4: 25 }) // 100
 * 
 * // Individual parameters
 * calculateAnnual('Average', 80, 85, 90, 85) // 85
 * 
 * // Fixed
 * calculateAnnual('Fixed', [1, 0, 0, 0]) // 1
 */
export function calculateAnnual(
  aggregationType: AggregationType,
  quarterlyValuesOrQ1: [number, number, number, number] | QuarterlyValues | number,
  q2?: number,
  q3?: number,
  q4?: number
): number {
  // Parse different input formats
  let values: [number, number, number, number]

  if (typeof quarterlyValuesOrQ1 === 'number' && q2 !== undefined && q3 !== undefined && q4 !== undefined) {
    // Individual parameters: calculateAnnual('Sum', 25, 25, 25, 25)
    values = [quarterlyValuesOrQ1, q2, q3, q4]
  } else if (Array.isArray(quarterlyValuesOrQ1)) {
    // Array format: calculateAnnual('Sum', [25, 25, 25, 25])
    values = quarterlyValuesOrQ1
  } else if (typeof quarterlyValuesOrQ1 === 'object' && quarterlyValuesOrQ1 !== null) {
    // Object format: calculateAnnual('Sum', { q1: 25, q2: 25, q3: 25, q4: 25 })
    const obj = quarterlyValuesOrQ1 as QuarterlyValues
    values = [obj.q1, obj.q2, obj.q3, obj.q4]
  } else {
    throw new Error('Invalid quarterly values format')
  }

  const [q1, q2Val, q3Val, q4Val] = values

  switch (aggregationType) {
    case 'Sum':
      return q1 + q2Val + q3Val + q4Val

    case 'Average':
      const avg = (q1 + q2Val + q3Val + q4Val) / 4
      return Math.round(avg * 100) / 100

    case 'Fixed':
      // Fixed values: typically binary (0 or 1), use q1 as the annual value
      return q1

    default:
      throw new Error(`Unknown aggregation type: ${aggregationType}`)
  }
}

/**
 * Distribute Annual Target to Quarters
 * 
 * Inverse of calculateAnnual(). Given an annual target and aggregation type,
 * returns quarterly values that will sum/average to the annual target.
 * 
 * @param aggregationType - 'Sum' | 'Average' | 'Fixed'
 * @param annualTarget - The target annual value
 * @returns Object with q1, q2, q3, q4 values
 * @example
 * distributeAnnualToQuarters('Sum', 100) // { q1: 25, q2: 25, q3: 25, q4: 25 }
 * distributeAnnualToQuarters('Average', 90) // { q1: 90, q2: 90, q3: 90, q4: 90 }
 * distributeAnnualToQuarters('Fixed', 1) // { q1: 1, q2: 1, q3: 1, q4: 1 }
 */
export function distributeAnnualToQuarters(
  aggregationType: AggregationType,
  annualTarget: number
): QuarterlyValues {
  switch (aggregationType) {
    case 'Sum':
      // Divide equally across 4 quarters
      const perQuarter = Math.round((annualTarget / 4) * 100) / 100
      return {
        q1: perQuarter,
        q2: perQuarter,
        q3: perQuarter,
        q4: perQuarter,
      }

    case 'Average':
      // All quarters equal the annual target
      return {
        q1: annualTarget,
        q2: annualTarget,
        q3: annualTarget,
        q4: annualTarget,
      }

    case 'Fixed':
      // Fixed: all quarters get same value
      return {
        q1: annualTarget,
        q2: annualTarget,
        q3: annualTarget,
        q4: annualTarget,
      }

    default:
      throw new Error(`Unknown aggregation type: ${aggregationType}`)
  }
}

/**
 * Validate Target Variance
 * 
 * Checks if the calculated annual total (from quarters) matches the target annual value.
 * Returns warning if variance exceeds tolerance.
 * 
 * @param annualTarget - The target annual value (user input)
 * @param calculatedAnnual - The calculated annual from Q1-Q4 (derived)
 * @param tolerance - Allowed variance percentage (default 0.01 = 1%)
 * @returns Variance check result with warning
 * @example
 * validateTargetVariance(100, 99) // { isValid: true, variance: 1, percentage: 1, warning: null }
 * validateTargetVariance(100, 75) // { isValid: false, variance: 25, percentage: 25, warning: "..." }
 */
export function validateTargetVariance(
  annualTarget: number,
  calculatedAnnual: number,
  tolerance: number = 0.01
): VarianceCheckResult {
  const variance = Math.abs(annualTarget - calculatedAnnual)
  const percentage = annualTarget !== 0 ? (variance / annualTarget) * 100 : 0
  const isValid = percentage <= tolerance * 100

  let warning: string | null = null
  if (!isValid) {
    warning = `Annual Target (${annualTarget}) doesn't match calculated total (${calculatedAnnual}). Variance: ${percentage.toFixed(1)}%`
  }

  return {
    isValid,
    variance: Math.round(variance * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    warning,
  }
}

/**
 * Validate quarterly values against annual target
 * 
 * @param annualTarget - Expected total
 * @param aggregationType - Type of aggregation
 * @param q1 - Q1 value
 * @param q2 - Q2 value
 * @param q3 - Q3 value
 * @param q4 - Q4 value
 * @returns { isValid: boolean, difference: number, warning: string | null }
 */
export function validateQuarterlyAgainstAnnual(
  annualTarget: number,
  aggregationType: AggregationType,
  q1: number,
  q2: number,
  q3: number,
  q4: number
): { isValid: boolean; difference: number; warning: string | null } {
  const calculatedAnnual = calculateAnnual(aggregationType, q1, q2, q3, q4)
  const difference = annualTarget - calculatedAnnual

  return {
    isValid: difference === 0,
    difference,
    warning:
      difference !== 0 ? `Expected ${annualTarget}, but quarterly values sum to ${calculatedAnnual}` : null,
  }
}

// ============================================================================
// VALIDATION & CONSTRAINTS
// ============================================================================

/**
 * Validate annual target value
 * 
 * Ensures annual target is within reasonable bounds.
 */
export function isValidAnnualTarget(value: number): { valid: boolean; error?: string } {
  if (typeof value !== 'number') {
    return { valid: false, error: 'Annual target must be a number' }
  }

  if (value < 0) {
    return { valid: false, error: 'Annual target cannot be negative' }
  }

  if (!isFinite(value)) {
    return { valid: false, error: 'Annual target must be a finite number' }
  }

  return { valid: true }
}

/**
 * Validate quarterly values
 * 
 * Ensures all quarterly values are valid numbers.
 */
export function isValidQuarterlyValues(
  quarterly: [number, number, number, number] | QuarterlyValues
): { valid: boolean; errors: string[] } {
  const quarters = Array.isArray(quarterly) ? quarterly : [quarterly.q1, quarterly.q2, quarterly.q3, quarterly.q4]
  const errors: string[] = []

  quarters.forEach((value, index) => {
    const qName = `Q${index + 1}`
    if (typeof value !== 'number') {
      errors.push(`${qName} must be a number`)
    } else if (value < 0) {
      errors.push(`${qName} cannot be negative`)
    } else if (!isFinite(value)) {
      errors.push(`${qName} must be finite`)
    }
  })

  return { valid: errors.length === 0, errors }
}

/**
 * Check if two quarterly value sets are equal
 */
export function areQuarterliesEqual(
  q1a: number,
  q2a: number,
  q3a: number,
  q4a: number,
  q1b: number,
  q2b: number,
  q3b: number,
  q4b: number
): boolean {
  return q1a === q1b && q2a === q2b && q3a === q3b && q4a === q4b
}

// ============================================================================
// DATE RANGE UTILITIES (PHASE 1: Overlap Detection)
// ============================================================================

/**
 * Check if a date range overlaps with any existing ranges
 * 
 * Used in Phase 1 to detect fiscal year conflicts.
 * 
 * @param startDate - ISO string or 'YYYY-MM-DD'
 * @param endDate - ISO string or 'YYYY-MM-DD'
 * @param existingRanges - Array of { start, end } date strings
 * @returns true if overlap detected
 * @example
 * checkDateRangeOverlap(
 *   '2025-01-01',
 *   '2025-12-31',
 *   [{ start: '2024-01-01', end: '2024-12-31' }]
 * ) // false (no overlap)
 * 
 * checkDateRangeOverlap(
 *   '2025-06-01',
 *   '2025-12-31',
 *   [{ start: '2025-01-01', end: '2025-12-31' }]
 * ) // true (overlaps with existing)
 */
export function checkDateRangeOverlap(
  startDate: string,
  endDate: string,
  existingRanges: Array<{ start: string; end: string }>
): boolean {
  const newStart = new Date(startDate)
  const newEnd = new Date(endDate)

  return existingRanges.some(({ start, end }) => {
    const existingStart = new Date(start)
    const existingEnd = new Date(end)

    // No overlap if:
    // 1. New range ends before existing range starts
    // 2. New range starts after existing range ends
    const noOverlap = newEnd < existingStart || newStart > existingEnd

    return !noOverlap
  })
}

/**
 * Find overlapping range details
 * 
 * Returns information about which existing range(s) overlap with the input range.
 * Useful for generating error messages.
 * 
 * @param startDate - ISO string
 * @param endDate - ISO string
 * @param existingRanges - Array of { start, end, year?, label? }
 * @returns Array of overlapping ranges with details
 */
export function findOverlappingRanges(
  startDate: string,
  endDate: string,
  existingRanges: Array<{ start: string; end: string; year?: number; label?: string }>
): Array<{ year?: number; label?: string; start: string; end: string }> {
  const newStart = new Date(startDate)
  const newEnd = new Date(endDate)

  return existingRanges.filter(({ start, end }) => {
    const existingStart = new Date(start)
    const existingEnd = new Date(end)
    const noOverlap = newEnd < existingStart || newStart > existingEnd
    return !noOverlap
  })
}

// ============================================================================
// FORMATTING & DISPLAY UTILITIES
// ============================================================================

/**
 * Get aggregation type display label
 */
export function getAggregationLabel(type: AggregationType): {
  symbol: string
  label: string
  description: string
} {
  const labels = {
    Sum: {
      symbol: '∑',
      label: 'Sum',
      description: 'Total of all quarterly values',
    },
    Average: {
      symbol: 'x̄',
      label: 'Average',
      description: 'Mean of quarterly values',
    },
    Fixed: {
      symbol: '◻',
      label: 'Fixed',
      description: 'Same value for all quarters',
    },
  }

  return labels[type]
}

/**
 * Get aggregation type styling (for UI indicators)
 */
export function getAggregationStyle(type: AggregationType): {
  bgColor: string
  textColor: string
  borderColor: string
  icon: string
} {
  const styles = {
    Sum: {
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      borderColor: 'border-blue-300',
      icon: '∑',
    },
    Average: {
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700',
      borderColor: 'border-purple-300',
      icon: 'x̄',
    },
    Fixed: {
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-300',
      icon: '◻',
    },
  }

  return styles[type]
}

/**
 * Format quarterly data for display
 * 
 * Converts quarterly values to readable format.
 */
export function formatQuarterlyData(
  quarterly: [number, number, number, number] | QuarterlyValues
): string {
  const quarters = Array.isArray(quarterly)
    ? quarterly
    : [quarterly.q1, quarterly.q2, quarterly.q3, quarterly.q4]
  return `Q1: ${quarters[0]}, Q2: ${quarters[1]}, Q3: ${quarters[2]}, Q4: ${quarters[3]}`
}

/**
 * Format number for display (handles decimals and percentages)
 */
export function formatValue(value: number | null, decimals = 2): string {
  if (value === null || value === undefined) return '-'
  return value.toFixed(decimals)
}

/**
 * Parse quarterly string input and validate
 */
export function parseQuarterlyInput(input: string): number | null {
  const parsed = parseFloat(input)
  return isNaN(parsed) ? null : parsed
}
