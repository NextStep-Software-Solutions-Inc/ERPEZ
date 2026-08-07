import { LIB } from '@/features/planning/line-item-budgeting/line-item-budget/types'

export interface FilterCriteria {
  searchQuery: string
  selectedStatuses: string[]
  selectedSourceTypes: string[]
  selectedYear: string
}

/**
 * Check if LIB matches search query (searches libNumber, libName, sourceName)
 */
export const matchesSearch = (lib: LIB, query: string): boolean => {
  if (!query) return true
  const lowerQuery = query.toLowerCase()
  const libNumber = lib.libNumber || ''
  const libName = lib.name || ''
  const sourceName = lib.sourceName || ''
  return (
    libNumber.toLowerCase().includes(lowerQuery) ||
    libName.toLowerCase().includes(lowerQuery) ||
    sourceName.toLowerCase().includes(lowerQuery)
  )
}

/**
 * Check if LIB status matches selected statuses
 */
export const matchesStatus = (lib: LIB, statuses: string[]): boolean => {
  if (statuses.length === 0) return true
  const status = lib.status || ''
  return statuses.includes(status)
}

/**
 * Check if LIB source type matches selected source types
 */
export const matchesSourceType = (lib: LIB, sourceTypes: string[]): boolean => {
  if (sourceTypes.length === 0) return true
  const sourceType = lib.sourceType || ''
  return sourceTypes.includes(sourceType)
}

/**
 * Check if LIB fiscal year matches selected year
 */
export const matchesYear = (lib: LIB, year: string): boolean => {
  if (!year || year === 'all') return true
  const fyYearStr = typeof lib.fiscalYear === 'string'
    ? lib.fiscalYear
    : String(lib.fiscalYear?.year || '')
  return fyYearStr === year
}

/**
 * Apply all filters to LIB list
 */
export const filterLibs = (libs: LIB[], criteria: FilterCriteria): LIB[] => {
  if (!libs) return []
  return libs.filter((lib) => {
    if (!lib) return false
    return (
      matchesSearch(lib, criteria.searchQuery) &&
      matchesStatus(lib, criteria.selectedStatuses) &&
      matchesSourceType(lib, criteria.selectedSourceTypes) &&
      matchesYear(lib, criteria.selectedYear)
    )
  })
}
