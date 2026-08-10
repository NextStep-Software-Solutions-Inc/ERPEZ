import { FunctionCategory } from '@/features/planning/master-kpi/types'
import type { OPCRItem } from '../types/type.opcr'

/**
 * Count KPIs by function category
 * @param opcrItems - Array of OPCR items
 * @param category - Function category to count for
 * @returns Number of KPIs in the given category
 */
export const countKPIsByCategory = (
  opcrItems: OPCRItem[] | undefined | null,
  category: FunctionCategory | string,
): number => {
  if (!opcrItems?.length) return 0
  return opcrItems.filter((item) => item.functionCategory === category).length
}

/**
 * Get all KPIs grouped and counted by their function categories
 * @param opcrItems - Array of OPCR items
 * @returns Record with categories as keys and counts as values
 */
export const getAllCategoryKPICounts = (
  opcrItems: OPCRItem[] | undefined | null,
): Record<string, number> => {
  const counts: Record<string, number> = {
    Strategic: 0,
    Core: 0,
    Support: 0,
  }

  if (!opcrItems?.length) return counts

  opcrItems.forEach((item) => {
    const category = item.functionCategory
    if (category && category in counts) {
      counts[category] += 1
    }
  })

  return counts
}

/**
 * Filter KPIs by function category
 * @param opcrItems - Array of OPCR items
 * @param category - Function category to filter for
 * @returns Filtered array of OPCR items
 */
export const filterKPIsByCategory = (
  opcrItems: OPCRItem[] | undefined | null,
  category: FunctionCategory | string,
): OPCRItem[] => {
  if (!opcrItems?.length) return []
  return opcrItems.filter((item) => item.functionCategory === category)
}
