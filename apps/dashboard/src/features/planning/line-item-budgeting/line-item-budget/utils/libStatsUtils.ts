import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

export interface LibStats {
  total: number
  draft: number
  submitted: number
  approved: number
  returned: number
  totalBudget: number
  years: string[]
}

/**
 * Calculate statistics from LIB list
 */
export const calculateStats = (libs: LIB[]): LibStats => {
  const years = libs
    .map((l) => {
      if (!l.fiscalYear) return ''
      return typeof l.fiscalYear === 'string'
        ? l.fiscalYear
        : String(l.fiscalYear.year || '')
    })
    .filter(Boolean)

  return {
    total: libs.length,
    draft: libs.filter((l) => l.status === 'Draft').length,
    submitted: libs.filter((l) => l.status === 'Submitted').length,
    approved: libs.filter((l) => l.status === 'Approved').length,
    returned: libs.filter((l) => l.status === 'Returned').length,
    totalBudget: libs.reduce((sum, l) => sum + l.totalAmount, 0),
    years: [...new Set(years)].sort().reverse(),
  }
}

/**
 * Calculate total budget from LIB list
 */
export const calculateTotalBudget = (libs: LIB[]): number => {
  return libs.reduce((sum, l) => sum + l.totalAmount, 0)
}

/**
 * Get available fiscal years from LIB list
 */
export const getAvailableYears = (libs: LIB[]): string[] => {
  const years = libs
    .map((l) => {
      if (!l.fiscalYear) return ''
      return typeof l.fiscalYear === 'string'
        ? l.fiscalYear
        : String(l.fiscalYear.year || '')
    })
    .filter(Boolean)
  return [...new Set(years)].sort().reverse()
}

/**
 * Format budget amount (e.g., 1000000 -> "1.0M")
 */
export const formatBudgetAmount = (amount: number): string => {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K`
  }
  return amount.toString()
}
