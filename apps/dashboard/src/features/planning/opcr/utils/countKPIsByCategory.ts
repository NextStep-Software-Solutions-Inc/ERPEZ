import { FunctionCategory } from '@/features/planning/master-kpi/types'
import type { OPCRItem } from '../types/type.opcr'

/**
 * Normalizes function category values across API variations (e.g. StrategicPriority -> Strategic, CoreFunction -> Core, MandatorySupport -> Support)
 */
export const normalizeCategory = (cat?: string | null): string => {
  if (!cat) return ''
  const lower = cat.toLowerCase()
  if (lower.includes('strategic')) return 'Strategic'
  if (lower.includes('core')) return 'Core'
  if (lower.includes('support') || lower.includes('mandatory')) return 'Support'
  return cat
}

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
  const targetCategory = normalizeCategory(category)
  return opcrItems.filter((item) => {
    const itemCat = item.functionCategory || item.kpiAssignment?.fyActiveKPI?.functionCategory
    return normalizeCategory(itemCat) === targetCategory
  }).length
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
    const itemCat = item.functionCategory || item.kpiAssignment?.fyActiveKPI?.functionCategory
    const norm = normalizeCategory(itemCat)
    if (norm && norm in counts) {
      counts[norm] += 1
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
  const targetCategory = normalizeCategory(category)
  return opcrItems.filter((item) => {
    const itemCat = item.functionCategory || item.kpiAssignment?.fyActiveKPI?.functionCategory
    return normalizeCategory(itemCat) === targetCategory
  })
}
